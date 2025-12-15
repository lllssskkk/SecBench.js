#!/usr/bin/env python3
"""Process a directory of package test folders.

For each immediate subdirectory, read package.json and:
 - If fixedVersion does not match semver-like pattern, record the subdirectory name.
 - Otherwise, create subdir/Safe and subdir/Vul and copy existing contents into both.
 - In Safe/package.json, swap the values of `fixedVersion` and the dependency
   version for the dependency whose key is usually the same as the subdirectory name.
 - If the dependency key does not match the subdirectory name, record the case.

Usage: process_packages.py [-n|--dry-run] PATH
"""
from pathlib import Path
import argparse
import json
import re
import shutil
import sys

VERSION_RE = re.compile(r"^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")


def parse_semver(ver: str):
    """Parse a semver string into (major, minor, patch, prerelease_list).
    Returns None on failure."""
    m = re.match(
        r"^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$", ver
    )
    if not m:
        return None
    major, minor, patch = int(m.group(1)), int(m.group(2)), int(m.group(3))
    prerelease = m.group(4)
    if prerelease is None:
        pre = None
    else:
        pre = prerelease.split(".")
    return (major, minor, patch, pre)


def compare_semver(a: str, b: str) -> int:
    """Compare semver strings a and b.
    Return 1 if a>b, 0 if a==b, -1 if a<b. Returns None if parsing fails."""
    pa = parse_semver(a)
    pb = parse_semver(b)
    if pa is None or pb is None:
        return None
    for i in range(3):
        if pa[i] > pb[i]:
            return 1
        if pa[i] < pb[i]:
            return -1
    # major/minor/patch equal -> handle prerelease
    a_pre = pa[3]
    b_pre = pb[3]
    if a_pre is None and b_pre is None:
        return 0
    if a_pre is None:
        return 1
    if b_pre is None:
        return -1
    # both have prerelease lists
    la = len(a_pre)
    lb = len(b_pre)
    for i in range(max(la, lb)):
        if i >= la:
            return -1
        if i >= lb:
            return 1
        xa = a_pre[i]
        xb = b_pre[i]
        if xa.isdigit() and xb.isdigit():
            na = int(xa)
            nb = int(xb)
            if na > nb:
                return 1
            if na < nb:
                return -1
        elif xa.isdigit():
            return -1
        elif xb.isdigit():
            return 1
        else:
            if xa > xb:
                return 1
            if xa < xb:
                return -1
    return 0


def copy_contents(src: Path, dest: Path):
    dest.mkdir(parents=True, exist_ok=True)
    for item in src.iterdir():
        if item.name in ("Safe", "Vul"):
            continue
        target = dest / item.name
        if item.is_dir():
            # copytree with dirs_exist_ok if available
            try:
                shutil.copytree(item, target, dirs_exist_ok=True)
            except TypeError:
                # older Python: implement naive recursive copy
                if target.exists():
                    # merge contents
                    for sub in item.iterdir():
                        if sub.is_dir():
                            copy_contents(sub, target / sub.name)
                        else:
                            shutil.copy2(sub, target / sub.name)
                else:
                    shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)


def load_json(path: Path):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to load JSON from {path}: {e}", file=sys.stderr)
        return None


def write_json(path: Path, data):
    try:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to write JSON to {path}: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Process package subdirectories")
    parser.add_argument("--path", help="Path to directory containing subdirectories")
    parser.add_argument(
        "-n",
        "--dry-run",
        action="store_true",
        help="Do not perform writes; just print actions",
    )
    args = parser.parse_args()

    base = Path(args.path).expanduser().resolve()
    if not base.exists() or not base.is_dir():
        print(f"Error: target '{base}' is not an existing directory", file=sys.stderr)
        return

    invalid_fixed = []
    mismatched_deps = []
    missing_package = []

    # Track primary failure type per directory and lists per failure type
    primary_failure = {}  # name -> type
    type_lists = {
        "MissingPackage": [],
        "InvalidJSON": [],
        "InvalidFixed": [],
        "CopyError": [],
        "MismatchedDeps": [],
        "SwapError": [],
        "InvalidDepVersion": [],
        "SameVersion": [],
        "VersionNotGreater": [],
    }

    def mark_failure(name: str, category: str):
        # Set primary failure if not already set
        if name not in primary_failure:
            primary_failure[name] = category
            type_lists.setdefault(category, []).append(name)

    failed_root = base / "Failed"

    for sub in sorted([p for p in base.iterdir() if p.is_dir()]):
        pkg_json_path = sub / "package.json"
        if not pkg_json_path.exists():
            missing_package.append(sub.name)
            mark_failure(sub.name, "MissingPackage")
            print(f"Skipping {sub.name}: package.json not found")
            continue

        pkg = load_json(pkg_json_path)
        if pkg is None:
            # invalid JSON
            mark_failure(sub.name, "InvalidJSON")
            missing_package.append(sub.name)
            print(f"Skipping {sub.name}: package.json could not be parsed")
            continue

        fixed = pkg.get("fixedVersion")
        if not isinstance(fixed, str) or not VERSION_RE.match(fixed):
            invalid_fixed.append(sub.name)
            mark_failure(sub.name, "InvalidFixed")
            print(f"Skipping {sub.name}: fixedVersion missing or invalid ('{fixed}')")
            continue

        # Determine dependency key: prefer exact subdir name
        deps = pkg.get("dependencies")
        dep_key = None
        dep_version = None
        if isinstance(deps, dict):
            if sub.name in deps:
                dep_key = sub.name
                dep_version = deps[sub.name]
            elif len(deps) == 1:
                # fallback to the single dependency present
                dep_key, dep_version = next(iter(deps.items()))
                mismatched_deps.append(sub.name)
                mark_failure(sub.name, "MismatchedDeps")
                print(
                    f"Note {sub.name}: dependency key '{dep_key}' used (does not match dir name)"
                )
            else:
                # multiple dependencies and none matches subdir name
                mismatched_deps.append(sub.name)
                mark_failure(sub.name, "MismatchedDeps")
                print(
                    f"Note {sub.name}: multiple dependencies present and none match dir name; skipping swap"
                )
                dep_key = None
        else:
            mismatched_deps.append(sub.name)
            mark_failure(sub.name, "MismatchedDeps")
            print(
                f"Note {sub.name}: dependencies missing or not an object; skipping swap"
            )

        # If we have a dependency version, validate it and ensure fixedVersion > dependency version
        if dep_key and isinstance(dep_version, str):
            # extract a semver-like token from dep_version (handles ^, ~, etc.)
            m = re.search(r"\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?", dep_version)
            if not m:
                print(
                    f"Note {sub.name}: dependency version '{dep_version}' is not a strict semver"
                )
                mark_failure(sub.name, "InvalidDepVersion")
                # treat as failure for our processing
                continue
            dep_clean = m.group(0)
            cmp = compare_semver(fixed, dep_clean)
            if cmp is None:
                print(
                    f"Note {sub.name}: could not compare versions ('{fixed}' vs '{dep_clean}')"
                )
                mark_failure(sub.name, "InvalidFixed")
                continue
            if cmp == 0:
                print(
                    f"Skipping {sub.name}: fixedVersion '{fixed}' equals dependency version '{dep_clean}'"
                )
                mark_failure(sub.name, "SameVersion")
                continue
            if cmp < 0:
                print(
                    f"Skipping {sub.name}: fixedVersion '{fixed}' is not greater than dependency version '{dep_clean}'"
                )
                mark_failure(sub.name, "VersionNotGreater")
                continue
        elif dep_key and not isinstance(dep_version, str):
            print(
                f"Note {sub.name}: dependency version for '{dep_key}' is not a string; skipping"
            )
            mark_failure(sub.name, "InvalidDepVersion")
            continue

        # Create Safe and Vul directories and copy contents
        safe_dir = sub / "Safe"
        vul_dir = sub / "Vul"
        print(f"Creating copies for {sub.name}: Safe and Vul")
        if args.dry_run:
            print(
                f"Dry-run: would create '{safe_dir}' and '{vul_dir}' and copy contents"
            )
        else:
            try:
                copy_contents(sub, safe_dir)
                copy_contents(sub, vul_dir)
            except Exception as e:
                print(f"Error copying contents for {sub.name}: {e}", file=sys.stderr)
                mark_failure(sub.name, "CopyError")
                # skip further processing for this subdirectory
                continue

            # Modify Safe/package.json by swapping fixedVersion and dep version when possible
            safe_pkg_path = safe_dir / "package.json"
            safe_pkg = load_json(safe_pkg_path)
            if safe_pkg is None:
                print(
                    f"Warning: Safe package.json for {sub.name} could not be loaded; skipping modification"
                )
                mark_failure(sub.name, "SwapError")
                continue

            if (
                dep_key
                and "dependencies" in safe_pkg
                and isinstance(safe_pkg["dependencies"], dict)
                and dep_key in safe_pkg["dependencies"]
            ):
                old_fixed = safe_pkg.get("fixedVersion")
                old_dep = safe_pkg["dependencies"][dep_key]
                safe_pkg["fixedVersion"] = old_dep
                safe_pkg["dependencies"][dep_key] = old_fixed
                write_json(safe_pkg_path, safe_pkg)
                print(
                    f"Swapped versions in {safe_pkg_path}: fixedVersion '{old_fixed}' <-> dependency '{dep_key}':'{old_dep}'"
                )
            else:
                print(
                    f"Skipping swap for {sub.name}: dependency key not suitable or missing in Safe/package.json"
                )
                mark_failure(sub.name, "SwapError")

    # Move failed directories into Failed/<Category> under base
    if primary_failure:
        print(
            f"\nMoving {len(primary_failure)} failed directories into '{failed_root}' (by category)"
        )
        if args.dry_run:
            for name, cat in primary_failure.items():
                print(f"Dry-run: would move '{name}' -> '{failed_root / cat / name}'")
        else:
            for cat, names in type_lists.items():
                if not names:
                    continue
                cat_dir = failed_root / cat
                cat_dir.mkdir(parents=True, exist_ok=True)
                for name in names:
                    src = base / name
                    if not src.exists():
                        print(f"Failed to move '{name}': source does not exist")
                        continue
                    dest = cat_dir / name
                    counter = 1
                    while dest.exists():
                        dest = cat_dir / f"{name}_{counter}"
                        counter += 1
                    try:
                        shutil.move(str(src), str(dest))
                        print(f"Moved '{name}' -> '{dest}'")
                    except Exception as e:
                        print(
                            f"Failed to move '{name}' -> '{dest}': {e}", file=sys.stderr
                        )

    print("\nSummary:")
    if type_lists["InvalidFixed"]:
        print("Directories with missing/invalid fixedVersion:")
        for name in type_lists["InvalidFixed"]:
            print(" -", name)
    if type_lists["MismatchedDeps"]:
        print("Directories with dependency key mismatches or issues:")
        for name in type_lists["MismatchedDeps"]:
            print(" -", name)
    if type_lists["MissingPackage"] or type_lists["InvalidJSON"]:
        print("Directories missing or invalid package.json:")
        for name in type_lists["MissingPackage"] + type_lists["InvalidJSON"]:
            print(" -", name)
    if type_lists["CopyError"]:
        print("Directories failed during copy:")
        for name in type_lists["CopyError"]:
            print(" -", name)
    if type_lists["SwapError"]:
        print("Directories with swap/patch errors:")
        for name in type_lists["SwapError"]:
            print(" -", name)
    if type_lists["InvalidDepVersion"]:
        print("Directories with invalid dependency version format:")
        for name in type_lists["InvalidDepVersion"]:
            print(" -", name)
    if type_lists["SameVersion"]:
        print("Directories where fixedVersion equals dependency version:")
        for name in type_lists["SameVersion"]:
            print(" -", name)
    if type_lists["VersionNotGreater"]:
        print("Directories where fixedVersion is not greater than dependency version:")
        for name in type_lists["VersionNotGreater"]:
            print(" -", name)


if __name__ == "__main__":
    main()
