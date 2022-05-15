import * as fs from 'fs';
import { Client } from '../structures/client';
import { FileVariableType } from '../typings/variables';

export class Compiler {
    public outDir: string;
    
    private static instance: Compiler;

    private constructor(outDir: string) {
        this.outDir = outDir;
    }

    public static getInstance(outDir?: string): Compiler {
        if (!Compiler.instance) {
            Compiler.instance = new Compiler(outDir);
        }
        return Compiler.instance;
    }

    async getData() {
        return (await Client.getInstance()).parser.parsed;
    }

    compile = async () => {
        const data = await this.getData();
        if (!fs.existsSync(this.outDir)) fs.mkdirSync(this.outDir);
        if (!fs.existsSync(`${this.outDir}/${data.datapackData.name}`)) fs.mkdirSync(`${this.outDir}/${data.datapackData.name}`);


        const packData = {
            "pack": {
                "pack_format": data.datapackData.pack_format ? data.datapackData.pack_format : 9,
                "description": data.datapackData.description ? data.datapackData.description : "Compiled using MDPT",
            }
        };

        fs.writeFileSync(`${this.outDir}/${data.datapackData.name}/pack.mcmeta`, JSON.stringify(packData), {flag: "w"});


        for (const func of data.functions) {
            const filePath = func.filePath;
            let path = `${this.outDir}/${data.datapackData.name}/data/${data.datapackData.name}/functions/${filePath}.mcfunction`.split("/").slice(0, -1);

            for (let i = 1; i <= path.length; i++) {
                let p = path.slice(0, i).join("/");

                if (!fs.existsSync(p)) fs.mkdirSync(p);
            }

            const file = await fs.promises.writeFile(`${this.outDir}/${data.datapackData.name}/data/${data.datapackData.name}/functions/${filePath}.mcfunction`, func.body, {flag: "w"});
            const body = func.body;
            const args = func.args;
            const name = func.name;
        }

        for (const file of (data.variables as FileVariableType[]).filter(x => x.type == "file")) {
            const filePath = file.filePath;
            let path = `${this.outDir}/${data.datapackData.name}/data/${filePath}`.split("/").slice(0, -1);

            for (let i = 1; i <= path.length; i++) {
                let p = path.slice(0, i).join("/");

                if (!fs.existsSync(p)) fs.mkdirSync(p);
            }


            const f = await fs.promises.writeFile(`${this.outDir}/${data.datapackData.name}/data/${filePath}`, file.fileData, {flag: "w"});
        }

    }

}