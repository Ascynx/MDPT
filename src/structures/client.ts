import { Compiler } from "../compiler";
import { Parser } from "../parser";
import * as fs from 'fs';

export class Client {
    private static instance: Client;
    compiler: Compiler;
    parser: Parser;
    source: string;// data that's used for parsing
    outDir: string;
    inDir: string;
    package: any;

    
    private constructor(inDir?: string, outDir: string = "./out") {
        this.inDir = inDir;
        this.outDir = outDir;

        this.source = this.getFileData(inDir);

        this.compiler = Compiler.getInstance(outDir);
        this.parser = Parser.getInstance(this.source);
        this.package = this.getPackage();

    }

    public static async getInstance (inDir?: string, outDir?: string): Promise<Client> {
        if (!Client.instance) {
            Client.instance = new Client(inDir, outDir);
        }
        return await Client.instance;
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

}