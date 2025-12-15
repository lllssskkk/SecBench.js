"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util_1 = require("util");
const exec = util_1.promisify(require('child_process').exec);
const appRoot = path.resolve(__dirname);
function buildCredential(credStr) {
    const [username, password] = credStr.split(':');
    return {
        username,
        password,
    };
}
function getCredential(target, pythonLancher = 'python') {
    const script = `${pythonLancher} ${appRoot}\\wincred.py ${target}`;
    return exec(script)
        .then(result => result.stdout.trim())
        .then(buildCredential);
}
exports.getCredential = getCredential;
exports.default = getCredential;
