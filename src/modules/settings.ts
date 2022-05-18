import * as fs from 'fs';

//global settings

export class Settings {
    hasBeenRunOnce: boolean;
    language: string;
    version: string;
    checkUpdate: boolean; //defines if it will search for updates when running
    private static instance: Settings;

    private constructor() {
        this.hasBeenRunOnce = false;
        this.language = "en";
    }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    save() {
        fs.writeFileSync(`${process.cwd()}/settings.json`, JSON.stringify(this), {flag: "w"});

        return this;
    }

    load(strinfigied: string) {
        //tranforms the stringified settings into a Settings class object

        let settings = JSON.parse(strinfigied);
        for (let key of Object.keys(settings)) {
            this[key] = settings[key];
        };
        
        return this;
    }

}