import * as fs from 'fs';

//global settings

export class Settings {
    hasBeenRunOnce: boolean;
    language: string;
    version: string;
    checkUpdate: boolean; //defines if it will search for updates when running
    private static instance: Settings;

    private constructor() {
        this.hasBeenRunOnce = true;
        this.language = "en";
    }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    save() {
        fs.writeFileSync(__dirname.slice(0, -1) + "/settings.json", JSON.stringify(this));
    }

}