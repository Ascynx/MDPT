export const run = async () => {
    const status: {status: String,type: string}[] = [];

    for (let module of Object.keys(ModuleList)) {
        let moduleData = ModuleList[module];

        status.push({type: moduleData["name"], status: await (await importFile(moduleData["filePath"]))()});
    };

    console.table(status);
    return 0;
};


export const ModuleList = {
    //"compiler": {
    //    "name": "compiler",
    //    "filePath": `${process.cwd()}/dist/tests/compiler.js`
    //},
    "parser": {
        "name": "parser",
        "filePath": `${process.cwd()}/dist/tests/parser.js`
    }
}

const importFile = async(filePath: string) => {
    return (await import(filePath))?.default;
  }