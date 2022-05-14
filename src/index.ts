import { getPackage } from "./lib/utils/utils";
import { Client } from "./structures/client";
import { run } from './tests/index';

async function main(args: string[]) {
    if (!args.length) throw new Error("No targets defined");


    if (args[0] == "-h" || args[0] == "--help") {
        console.log("Usage: mdpt [target] [outputTarget] [options]");
        console.log("Options:");
        console.log("-h, --help: Show this help");
        console.log("-v, --version: Show the version");
        console.log("-t, --test: Run a test");

        process.exit(0); // stops the compiler from trying to load a "-h" or "--help" file :skull:
    }

    if (args[0] == "-t" || args[0] == "--test") {
        console.log("Testing...");
        await run();
        process.exit(0);
    }

    if (args[0] == "-v" || args[0] == "--version") {
        const pkg = await getPackage();
        console.log("v" + pkg.version);

        process.exit(0);
    }

    let inDir = args[0];
    let outDir = args[1] ? args[1] : "./out";

    const client = await Client.getInstance(inDir, outDir);

    await client.parseAndCompile();
}

main(process.argv.slice(2)).catch(console.error);