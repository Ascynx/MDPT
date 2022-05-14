#!usr/bin/node
import * as fs from 'fs';
/**
 * MDPT -> MinecraftDatapack+ transpiler
 * and file extension is .mdp (MinecraftDatapack+)
 */

const types = [
    "coordinatesX",
    "coordinatesY",
    "coordinatesZ"

 ];

 type FunctionType = {
    name: string,
    args: {
        [key: string]: string
    },
    body: string,
    filePath: string,
    transpiled?: string
    localVariables?: {name: string, data: any, type: string}[]
 }

 class File {
     regexes: {
       definitions: {
        type: string,
        regexes: RegExp[]
        }[],
        errors: {
            type: string,
            regexes: RegExp[]
            }[] 
     }
     data: string
     filePath: string
     functions: FunctionType[];
     datapackData: {name: string, pack_format?: number, description?: string};
     variables: any[];
     outPath: string;



     constructor(filePath: string) {
            this.regexes = {
                definitions: [
                    {
                        type: "function",
                        regexes: [
                            /(?<function>func\s+(?<name>[a-zA-Z0-9_:]+)\s*\((\s\S)*(?<args>.*?)\)\s+{(?<body>[\s\S]*?)})/gmi
                        ]
                    },
                    {
                        type: "variable",
                        regexes: [
                            /var\s+(?<name>[a-zA-Z0-9_\/.]+):\s*?(?<type>[a-zA-Z0-9_]+)\s*?=\s*?(?<value>[\s\S]*?);/gm
                        ]
                    },
                    {
                        type:"functioncall",
                        regexes: [
                            /(?<name>[a-zA-Z0-9_:]+)\(+(?<args>.*?)\)/gm
                        ]
                    }
                ],
                errors: [
                    {
                        type: "syntaxError",
                        regexes: [

                        ]
                    }
                ]
            };
            this.filePath = filePath;
            this.functions = [];
            this.datapackData = {name: "output"};
            this.variables = [];
 }

    getData = async () => {
         this.data =  await fs.promises.readFile(this.filePath, 'utf8');
     }

    //parse the data to get the different definities
    parseData = async () => {
        const definitions = this.regexes.definitions;
        const data = this.data;
        for (const definition of definitions) {
            const regexes = definition.regexes;
            const type = definition.type;
            for (const regex of regexes) {
                const matches = data.match(regex);
                if (matches) {
                    for (const match of matches) {
                        if (type == "function") {
                            let data = regex.exec(match);

                            if (!data) data = regex.exec(match);

                            let groups = data?.groups;

                            let func: FunctionType = {
                                name: groups.name,
                                args: {},
                                body: groups.body,
                                filePath: groups.name.split("::").join("/"), //(functionName:functionName[0]/functionName[1])
                                transpiled: ""
                            };

                            if (groups.args) {
                                const args = groups.args.split(",");
                                for (const arg of args) {
                                    const argData = arg.split(":");
                                    if (!argData[1]) throw new Error("Argument is missing a type");
                                    func.args[argData[0]] = argData[1];

                                }
                            }

                            this.functions.push(func);
                        } else if (type == "variable") {
                            let data = regex.exec(match);
                            if (!data) data = regex.exec(match);
                            let groups = data?.groups;
                            groups.value = groups.value.trim();
                            let scope = "global";

                            this.functions.forEach((func) => {
                                let funcData = regex.exec(func.body);

                                if (!funcData) funcData = regex.exec(func.body);
                                if (funcData?.groups) {
                                    funcData.groups.value = funcData?.groups.value.trim();
                                    let setOfValues = new Set([...Object.values(funcData?.groups),...Object.values(groups)]);

                                    if (setOfValues.size == 3) {
                                        groups.name = func.name + "::" + groups.name;
                                        scope = func.name;
                                    };
                                }

                            });

                            switch (groups.type) {
                                case ("file") :{
                                const filePath = groups.name;
                                const fileData = groups.value;

                                this.variables.push({filePath, fileData, type: "file"});

                                    break;
                                }
                                case ("coordinatesX") :{

                                    this.variables.push({value: groups.value, type: groups.type, name: groups.name});

                                    break;

                                }
                                case ("coordinatesY") :{

                                    this.variables.push({value: groups.value, type: groups.type, name: groups.name});
                                    break;

                                }
                                case ("coordinatesZ") :{

                                    this.variables.push({value: groups.value, type: groups.type, name: groups.name});

                                    break;

                                }
                                default: {
                                    this.variables.push({value: groups.value, type: groups.type, name: groups.name});

                                    if (scope != "global") {
                                        const func = this.functions.filter((func) => func.name == scope)[0];
                                        func.body = func.body.replace(regex, `data modify storage ${this.datapackData.name} ${groups.name.split("::").join(".")} set value ${groups.value}`);
                                    }
                                }
                            }

                            if (groups.name == "_data") {
                                if (groups.type == "name") this.datapackData.name = groups.value;
                                if (groups.type == "pack_format") this.datapackData.pack_format = parseInt(groups.value);
                                if (groups.type == "description") this.datapackData.description = groups.value;

                                continue;
                            }
                        }
                    }
                }
            }
        }
    }

    compile = async () => {
        if (!fs.existsSync(this.outPath)) fs.mkdirSync(this.outPath);
        if (!fs.existsSync(`${this.outPath}/${this.datapackData.name}`)) fs.mkdirSync(`${this.outPath}/${this.datapackData.name}`);


        const packData = {
            "pack": {
                "pack_format": this.datapackData.pack_format ? this.datapackData.pack_format : 9,
                "description": this.datapackData.description ? this.datapackData.description : "Compiled using MDPT",
            }
        };

        fs.writeFileSync(`${this.outPath}/${this.datapackData.name}/pack.mcmeta`, JSON.stringify(packData), {flag: "w"});


        for (const func of this.functions) {
            const filePath = func.filePath;
            let path = `${this.outPath}/${this.datapackData.name}/data/${this.datapackData.name}/functions/${filePath}.mcfunction`.split("/").slice(0, -1);

            for (let i = 1; i <= path.length; i++) {
                let p = path.slice(0, i).join("/");

                if (!fs.existsSync(p)) fs.mkdirSync(p);
            }

            const file = await fs.promises.writeFile(`${this.outPath}/${this.datapackData.name}/data/${this.datapackData.name}/functions/${filePath}.mcfunction`, func.body, {flag: "w"});
            const body = func.body;
            const args = func.args;
            const name = func.name;
        }

        for (const file of this.variables.filter(x => x.type == "file")) {
            const filePath = file.filePath;
            let path = `${this.outPath}/${this.datapackData.name}/data/${filePath}`.split("/").slice(0, -1);

            for (let i = 1; i <= path.length; i++) {
                let p = path.slice(0, i).join("/");

                if (!fs.existsSync(p)) fs.mkdirSync(p);
            }


            const f = await fs.promises.writeFile(`${this.outPath}/${this.datapackData.name}/data/${filePath}`, file.fileData, {flag: "w"});
        }

    }
}



async function main(args: string[]) {
    if (!args.length) throw new Error("No targets defined");


    if (args[0] == "-h" || args[0] == "--help") {
        console.log("Usage: mdpt [target] [outputTarget] [options]");
        console.log("Options:");
        console.log("-h, --help: Show this help");

        process.exit(0); // stops the compiler from trying to load a "-h" or "--help" file :skull:
    }

    let inDir = args[0];
    let outDir = args[1] ? args[1] : "./out";

    const file = new File(inDir);
    file.outPath = outDir;

    await file.getData();
    file.parseData();
    
    file.compile();
}



main(process.argv.slice(2)).catch(console.error);

/**
 * currently working shit:
 * 
 * parser can detect functions and variables
 * 
 * 
 * parser does transform variables that are in functions
 * 
 * parser gives informations for datapackData which are used in pack.mcmeta
 * 
 * compiler can compile into a datapack with files at the right place
 * you can choose which file is compiled and where it is compiled with arguments
 * 
 * you can compile custom files with variables that have the file type
 * 
 * show the help with -h or --help as arg
 * 
 * 
 * limitations / to upgrade:
 * 
 * currently can only compile single file into single project
 */


/**
 * ideas:
 * 
 * for variable definitions
 * 
 * Parser.on("definition", (handler, type, name, value) => {})
 * Parser.on("variableCall", (handler, type, name, value) => {})
 * Parser.on("functionCall", (handler, name, args) => {})
 * 
 * for debugging: (on rewrite)
 * 
 * define multiple modules and add different tests to each of them
 */