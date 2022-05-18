import { getPackage } from "./lib/utils/utils";
import { Client } from "./structures/client";
import { run } from './tests/index';
import { Logger } from "./tests/logger";
import * as fs from 'fs';
import { Settings } from "./modules/settings";
import { getUpdate, gitFetchJson } from "./modules/updater";
import fetch from 'node-fetch';
import * as child_process from 'child_process';
import * as readline from 'readline';
import { GitAsset } from "./typings/git";

async function main(args: string[]) {
    if (!args.length) throw new Error("No targets defined");
    let logger = Logger.getInstance();

    //guess I'm doing a switch case

    switch (args[0]) {

        case "-h":
        case "--help": {

            logger.sendMessage("Usage: mdpt [target] [outputTarget] [options]");
            logger.sendMessage("Options:");
            logger.sendMessage("-h, --help: Show this help");
            logger.sendMessage("-v, --version: Show the version");
            logger.sendMessage("-t, --test: Run a test");
            logger.sendMessage("-u --update: checks for update / updates the compiler");

            break;
        }

        case "-t":
        case "--test": {

            logger.sendMessage("Testing...");
            await run();
            break;
        }

        case "-v":
        case "--version": {
            const pkg = await getPackage();
            console.log("v" + pkg.version);

            break;
        }

        case "-u":
        case "--update": {

        let settings: Settings = fs.existsSync(`${process.cwd()}/settings.json`) ? Settings.getInstance().load(fs.readFileSync(`${process.cwd()}/settings.json`, {encoding: "utf8"})) : Settings.getInstance();


        //requires settings version
            const update = await getUpdate();
            if (settings.version != update.tag_name) {
                logger.sendMessage(`Found new version: ${settings.version} -> ${update.tag_name}`);

                let rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                rl.question("Do you want to update? (y/n)\n", async (answer) => {
                    switch (answer) {
                        case "y":
                            const assets: GitAsset[] = await (await gitFetchJson(update.assets_url))
                            logger.sendMessage("Downloading...");
                            const zip = await (await fetch(assets[0].browser_download_url)).arrayBuffer();
                            fs.writeFileSync(`${process.cwd()}/update.zip`, Buffer.from(zip));

                            logger.sendMessage("Extracting...");
                            child_process.execSync(`unzip -o ${process.cwd()}/update.zip -d ${process.cwd()}`);

                            logger.sendMessage("installing dependencies...");
                            child_process.execSync(`npm install`);

                            logger.sendMessage("Cleaning...");
                            child_process.execSync(`rm ${process.cwd()}/update.zip`);

                            logger.sendMessage("Done! Closing...");

                            rl.close();

                            break;
                            default: 
                            logger.sendMessage("Aborted!");
                            rl.close();
                    }
                });

            } else {
                logger.sendMessage("No updates found");
            }

            break;
    }

    default: {
            //initialize and run the client
            let settings: Settings = fs.existsSync(`${process.cwd()}/settings.json`) ? Settings.getInstance().load(fs.readFileSync(`${process.cwd()}/settings.json`, {encoding: "utf8"})) : Settings.getInstance();

            let inDir = args[0];
            let outDir = args[1] ? args[1] : "./out";
        
            //setup first time things
            if (!settings.hasBeenRunOnce) {
                settings.version = (await getPackage()).version;
                settings.hasBeenRunOnce = true;
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

            const client = Client.getInstance(inDir, outDir);

            client.setSettings(settings);

            await client.parseAndCompile();
        }
    }
}

main(process.argv.slice(2)).catch((e) => Logger.getInstance().sendError(e));