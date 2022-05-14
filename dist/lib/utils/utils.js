"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileData = exports.getPackage = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const getPackage = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${process.cwd()}/package.json`, "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });
};
exports.getPackage = getPackage;
const getFileData = (filePath) => {
    return fs.readFileSync(filePath, "utf8");
};
exports.getFileData = getFileData;
