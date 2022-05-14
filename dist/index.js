"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils/utils");
const client_1 = require("./structures/client");
const index_1 = require("./tests/index");
async function main(args) {
    if (!args.length)
        throw new Error("No targets defined");
    if (args[0] == "-h" || args[0] == "--help") {
        console.log("Usage: mdpt [target] [outputTarget] [options]");
        console.log("Options:");
        console.log("-h, --help: Show this help");
        console.log("-v, --version: Show the version");
        console.log("-t, --test: Run a test");
        process.exit(0);
    }
    if (args[0] == "-t" || args[0] == "--test") {
        console.log("Testing...");
        await (0, index_1.run)();
        process.exit(0);
    }
    if (args[0] == "-v" || args[0] == "--version") {
        const pkg = await (0, utils_1.getPackage)();
        console.log("v" + pkg.version);
        process.exit(0);
    }
    let inDir = args[0];
    let outDir = args[1] ? args[1] : "./out";
    const client = await client_1.Client.getInstance(inDir, outDir);
    await client.parseAndCompile();
}
main(process.argv.slice(2)).catch(console.error);
