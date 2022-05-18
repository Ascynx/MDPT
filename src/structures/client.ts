import { Compiler } from "../compiler";
import { ParsedData, Parser } from "../parser";
import * as fs from 'fs';
import { MiddlemanHandler } from "../middleman";
import { datapackDataTranslator, functionTranslator, Translator } from "../middleman/translator";
import { Settings } from "../modules/settings";

export class Client {
    private static instance: Client;
    compiler: Compiler;
    parser: Parser;
    middleManHandler: MiddlemanHandler;
    source: string;// data that's used for parsing
    outDir: string;
    inDir: string;
    package: any;
    private settings: Settings | any;

    
    private constructor(inDir?: string, outDir: string = "./out") {
        this.inDir = inDir;
        this.outDir = outDir;

        this.source = this.getFileData(inDir);

        this.compiler = Compiler.getInstance(outDir);
        this.parser = Parser.getInstance(this.source);
        this.middleManHandler = MiddlemanHandler.getInstance(this.parser.parsed);
        
        //setup middlemans
        let translator = Translator.getInstance(this.parser.parsed);
        translator.addModule(datapackDataTranslator.getInstance());
        translator.addModule(functionTranslator.getInstance());

        this.middleManHandler.registerHandler(translator);

        this.package = this.getPackage();

    }

    public static getInstance (inDir?: string, outDir?: string): Client {
        if (!Client.instance) {
            if (!inDir) return;
            Client.instance = new Client(inDir, outDir);
        }
        return Client.instance;
    }

    public setSettings(settings: Settings | any) {
        this.settings = settings;
    };
    
    public getSettings(): Settings | any {
        return this.settings;
    }

    private getFileData = (filePath: string) => {
        return fs.readFileSync(filePath, "utf8");
    }

    private getPackage = async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            fs.readFile(`${process.cwd()}/package.json`, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    }

    public parseAndCompile = async () => {
        await this.parser.parseData();
        await this.compiler.compile();
    }

    public postParsedData(data: ParsedData) {
        this.middleManHandler.setData(data);
        this.middleManHandler.runHandlers();
    }

}