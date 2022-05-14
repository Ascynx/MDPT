"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    data;
    regexes;
    parsed;
    static instance;
    constructor(data) {
        this.data = data;
        this.parsed = {
            variables: [],
            functions: [],
            datapackData: {
                name: "",
                pack_format: 0,
                description: ""
            }
        };
        this.regexes = {
            definitions: [
                {
                    type: "function",
                    regexes: [
                        /(?<function>func\s+(?<name>[a-zA-Z0-9_:]+)\s*\((\s\S)*(?<args>.*?)\)\s+{(?<body>[\s\S]*))/gmi
                    ]
                },
                {
                    type: "variable",
                    regexes: [
                        /var\s+(?<name>[a-zA-Z0-9_\/.]+):\s*?(?<type>[a-zA-Z0-9_]+)\s*?=\s*?(?<value>[\s\S]*?);/gm
                    ]
                },
                {
                    type: "functioncall",
                    regexes: [
                        /(?<name>[a-zA-Z0-9_:]+)\(+(?<args>.*?)\)/gm
                    ]
                }
            ],
            errors: [
                {
                    type: "syntaxError",
                    regexes: []
                }
            ]
        };
    }
    static getInstance = (data) => {
        if (!Parser.instance) {
            Parser.instance = new Parser(data);
        }
        return Parser.instance;
    };
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
                            if (!data)
                                data = regex.exec(match);
                            let groups = data?.groups;
                            const bodyStartIndex = this.data.indexOf(groups?.body);
                            const bodyEndIndex = findClosingBracketIndex(this.data, bodyStartIndex);
                            const body = this.data.substring(bodyStartIndex, bodyEndIndex);
                            let func = {
                                name: groups.name,
                                args: {},
                                body: body,
                                filePath: groups.name.split("::").join("/"),
                                transpiled: ""
                            };
                            console.log(func);
                            if (groups.args) {
                                const args = groups.args.split(",");
                                for (const arg of args) {
                                    const argData = arg.split(":");
                                    if (!argData[1])
                                        throw new Error("Argument is missing a type");
                                    func.args[argData[0]] = argData[1];
                                }
                            }
                            this.parsed.functions.push(func);
                        }
                        else if (type == "variable") {
                            let data = regex.exec(match);
                            if (!data)
                                data = regex.exec(match);
                            let groups = data?.groups;
                            groups.value = groups.value.trim();
                            let scope = "global";
                            this.parsed.functions.forEach((func) => {
                                let funcData = regex.exec(func.body);
                                if (!funcData)
                                    funcData = regex.exec(func.body);
                                if (funcData?.groups) {
                                    funcData.groups.value = funcData?.groups.value.trim();
                                    let setOfValues = new Set([...Object.values(funcData?.groups), ...Object.values(groups)]);
                                    if (setOfValues.size == 3) {
                                        groups.name = func.name + "::" + groups.name;
                                        scope = func.name;
                                    }
                                    ;
                                }
                            });
                            switch (groups.type) {
                                case ("file"): {
                                    const filePath = groups.name;
                                    const fileData = groups.value;
                                    this.parsed.variables.push({ filePath, fileData, type: "file" });
                                    break;
                                }
                                case ("coordinatesX"): {
                                    this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                    break;
                                }
                                case ("coordinatesY"): {
                                    this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                    break;
                                }
                                case ("coordinatesZ"): {
                                    this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                    break;
                                }
                                default: {
                                    this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                    if (scope != "global") {
                                        const func = this.parsed.functions.filter((func) => func.name == scope)[0];
                                        func.body = func.body.replace(regex, `data modify storage ${this.parsed.datapackData.name} ${groups.name.split("::").join(".")} set value ${groups.value}`);
                                    }
                                }
                            }
                            if (groups.name == "_data") {
                                if (groups.type == "name")
                                    this.parsed.datapackData.name = groups.value;
                                if (groups.type == "pack_format")
                                    this.parsed.datapackData.pack_format = parseInt(groups.value);
                                if (groups.type == "description")
                                    this.parsed.datapackData.description = groups.value;
                                continue;
                            }
                        }
                        else if (type == "functioncall") {
                            let data = regex.exec(match);
                            if (!data)
                                data = regex.exec(match);
                            let groups = data?.groups;
                            let func = this.parsed.functions.filter((func) => func.name == groups.name)[0];
                            if (!func)
                                continue;
                            let args = groups.args.split(",");
                        }
                    }
                }
            }
        }
        for (let func of this.parsed.functions) {
            for (const definition of definitions) {
                const regexes = definition.regexes;
                const type = definition.type;
                for (const regex of regexes) {
                    const matches = func.body.match(regex);
                    if (matches) {
                        for (const match of matches) {
                            if (type == "function") {
                                let data = regex.exec(match);
                                if (!data)
                                    data = regex.exec(match);
                                let groups = data?.groups;
                                const bodyStartIndex = this.data.indexOf(groups?.body);
                                const bodyEndIndex = findClosingBracketIndex(this.data, bodyStartIndex);
                                const body = this.data.substring(bodyStartIndex, bodyEndIndex);
                                let func = {
                                    name: groups.name,
                                    args: {},
                                    body: body,
                                    filePath: groups.name.split("::").join("/"),
                                    transpiled: ""
                                };
                                console.log(func);
                                if (groups.args) {
                                    const args = groups.args.split(",");
                                    for (const arg of args) {
                                        const argData = arg.split(":");
                                        if (!argData[1])
                                            throw new Error("Argument is missing a type");
                                        func.args[argData[0]] = argData[1];
                                    }
                                }
                                this.parsed.functions.push(func);
                            }
                            else if (type == "variable") {
                                let data = regex.exec(match);
                                if (!data)
                                    data = regex.exec(match);
                                let groups = data?.groups;
                                groups.value = groups.value.trim();
                                let scope = "global";
                                this.parsed.functions.forEach((func) => {
                                    let funcData = regex.exec(func.body);
                                    if (!funcData)
                                        funcData = regex.exec(func.body);
                                    if (funcData?.groups) {
                                        funcData.groups.value = funcData?.groups.value.trim();
                                        let setOfValues = new Set([...Object.values(funcData?.groups), ...Object.values(groups)]);
                                        if (setOfValues.size == 3) {
                                            groups.name = func.name + "::" + groups.name;
                                            scope = func.name;
                                        }
                                        ;
                                    }
                                });
                                switch (groups.type) {
                                    case ("file"): {
                                        const filePath = groups.name;
                                        const fileData = groups.value;
                                        this.parsed.variables.push({ filePath, fileData, type: "file" });
                                        break;
                                    }
                                    case ("coordinatesX"): {
                                        this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                        break;
                                    }
                                    case ("coordinatesY"): {
                                        this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                        break;
                                    }
                                    case ("coordinatesZ"): {
                                        this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                        break;
                                    }
                                    default: {
                                        this.parsed.variables.push({ value: groups.value, type: groups.type, name: groups.name });
                                        if (scope != "global") {
                                            const func = this.parsed.functions.filter((func) => func.name == scope)[0];
                                            func.body = func.body.replace(regex, `data modify storage ${this.parsed.datapackData.name} ${groups.name.split("::").join(".")} set value ${groups.value}`);
                                        }
                                    }
                                }
                                if (groups.name == "_data") {
                                    if (groups.type == "name")
                                        this.parsed.datapackData.name = groups.value;
                                    if (groups.type == "pack_format")
                                        this.parsed.datapackData.pack_format = parseInt(groups.value);
                                    if (groups.type == "description")
                                        this.parsed.datapackData.description = groups.value;
                                    continue;
                                }
                            }
                            else if (type == "functioncall") {
                                let data = regex.exec(match);
                                if (!data)
                                    data = regex.exec(match);
                                let groups = data?.groups;
                                let func = this.parsed.functions.filter((func) => func.name == groups.name)[0];
                                if (!func)
                                    continue;
                                let args = groups.args.split(",");
                            }
                        }
                    }
                }
            }
        }
    };
}
exports.Parser = Parser;
function findClosingParenthesisIndex(str, pos) {
    if (str[pos] !== '(') {
        throw new Error('The position must contain an opening bracket');
    }
    let level = 1;
    for (let index = pos + 1; index < str.length; index++) {
        if (str[index] === '(') {
            level++;
        }
        else if (str[index] === ')') {
            level--;
        }
        if (level === 0) {
            return index;
        }
    }
    return -1;
}
function findClosingBracketIndex(str, pos) {
    let level = 1;
    for (let index = pos + 1; index < str.length; index++) {
        if (str[index] === "{") {
            level++;
        }
        else if (str[index] === "}") {
            level--;
        }
        if (level === 0) {
            return index;
        }
    }
    return -1;
}
