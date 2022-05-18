import { getPackage } from "./lib/utils/utils";
import { Client } from "./structures/client";
import { run } from './tests/index';
import { Logger } from "./tests/logger";
import * as fs from 'fs';
import { Settings } from "./modules/settings";
import { getUpdate } from "./modules/updater";
import fetch from 'node-fetch';
import * as child_process from 'child_process';
import * as readline from 'readline';
import { rawListeners } from "process";

async function main(args: string[]) {
    if (!args.length) throw new Error("No targets defined");
    let logger = Logger.getInstance();

    if (args[0] == "-h" || args[0] == "--help") {
        logger.sendMessage("Usage: mdpt [target] [outputTarget] [options]");
        logger.sendMessage("Options:");
        logger.sendMessage("-h, --help: Show this help");
        logger.sendMessage("-v, --version: Show the version");
        logger.sendMessage("-t, --test: Run a test");
        logger.sendMessage("-u --update: checks for update / updates the compiler");

        process.exit(0); // stops the compiler from trying to load a "-h" or "--help" file :skull:
    }

    if (args[0] == "-t" || args[0] == "--test") {
        logger.sendMessage("Testing...");
        await run();
        process.exit(0);
    }

    if (args[0] == "-v" || args[0] == "--version") {
        const pkg = await getPackage();
        console.log("v" + pkg.version);

        process.exit(0);
    }

    let settings: Settings = fs.existsSync(`${process.cwd().slice(0, -1)}/settings.json`) ? require(`${process.cwd().slice(0, -1)}/settings.json`) : Settings.getInstance();


    //requires settings version
    if (args[0] == "-u" || args[0] == "--update") {
        const update = await getUpdate();
        if (settings.version != update.tag_name) {
            logger.sendMessage(`Found new version: ${settings.version} -> ${update.tag_name}`);

            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question("Do you want to update? (y/n) ", async (answer) => {
                if (answer == "y") {
                    logger.sendMessage("Downloading...");
                    const zip = (await fetch(update.zipball_url)).arrayBuffer;
                    fs.writeFileSync(`${process.cwd().slice(0, -1)}/update.zip`, Buffer.from(zip));

                    logger.sendMessage("Extracting...");
                    child_process.execSync(`unzip -o ${process.cwd().slice(0, -1)}/update.zip -d ${process.cwd().slice(0, -1)}`);

                    logger.sendMessage("installing dependencies...");
                    child_process.execSync(`npm install`);

                    logger.sendMessage("Cleaning...");
                    child_process.execSync(`rm ${process.cwd().slice(0, -1)}/update.zip`);

                    logger.sendMessage("Done! Closing...");

                    rl.close();
                } else rl.close();
        })

        } else {
            logger.sendMessage("No updates found");
        }

        process.exit(0);
    }

    let inDir = args[0];
    let outDir = args[1] ? args[1] : "./out";

    //setup first time things
    if (settings.hasBeenRunOnce) {
        settings.version = (await getPackage()).version;
        settings.hasBeenRunOnce = false;
        settings.save();
    };//when updating then reset firstTimeRan or update the version directly


    //check for update
    if (settings.checkUpdate) {
        const update = await getUpdate();
        if (update.tag_name != settings.version) {
            logger.sendMessage("A new version has been found!");
            logger.sendMessage(`${settings.version} -> ${update.tag_name}`);
            logger.sendMessage(`If you want to update, please re-run the compiler with "-u" or "--update" as the first argument`);

        }
    }

    //initialize and run the client
    const client = Client.getInstance(inDir, outDir);

    client.setSettings(settings);

    await client.parseAndCompile();
}

main(process.argv.slice(2)).catch((e) => Logger.getInstance().sendError(e));