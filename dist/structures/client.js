"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const compiler_1 = require("../compiler");
const parser_1 = require("../parser");
const fs = tslib_1.__importStar(require("fs"));
class Client {
    static instance;
    compiler;
    parser;
    source;
    outDir;
    inDir;
    package;
    constructor(inDir, outDir = "./out") {
        this.inDir = inDir;
        this.outDir = outDir;
        this.source = this.getFileData(inDir);
        this.compiler = compiler_1.Compiler.getInstance(outDir);
        this.parser = parser_1.Parser.getInstance(this.source);
        this.package = this.getPackage();
    }
    static async getInstance(inDir, outDir) {
        if (!Client.instance) {
            Client.instance = new Client(inDir, outDir);
        }
        return await Client.instance;
    }
    getFileData = (filePath) => {
        return fs.readFileSync(filePath, "utf8");
    };
    getPackage = async () => {
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
    parseAndCompile = async () => {
        await this.parser.parseData();
        await this.compiler.compile();
    };
}
exports.Client = Client;
