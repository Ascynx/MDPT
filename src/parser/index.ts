import { Client } from "../structures/client";
import { Logger } from "../tests/logger";
import { FunctionType } from "../typings/functions";
import { FileVariableType, VariableType } from "../typings/variables";


export type ParsedData = {
        variables: VariableType[] | FileVariableType[],
          functions: FunctionType[],
          datapackData: {
              name: string,
              pack_format: number,
              description: string
          }
}

export class ParserError extends Error {
        constructor(message: string) {
                super(message);
        }
}

export class Parser {
    data: string;
    regexes: {
        definitions: {
         type: string,
         regexes: RegExp[]
         }[],
         errors: {
             type: string,
             regexes: RegExp[]
             }[] 
      };

      parsed: {
          variables: VariableType[] | FileVariableType[],
            functions: FunctionType[],
            datapackData: {
                name: string,
                pack_format: number,
                description: string
            }
        };
        logger: Logger;

    private static instance: Parser;

    private constructor(data: string) {
        this.data = data;
        this.logger = Logger.getInstance();

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
                    ]//requires the use of findClosingBracketIndex to define the body
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
    }


    static getInstance = (data: string) => {
        if (!Parser.instance) {
            Parser.instance = new Parser(data);
        }
        return Parser.instance;
    }

    parseData = async () => {
        let logger = this.logger;

        //initialize tokenization

        let tokens: Token[] = [];


        this.data.split("\n").forEach((line, index) => {
                if (index == 0) tokens.push(new Token(0));
                else {
                        tokens.push(new Token(tokens[index-1].startIndex + (tokens[index-1].storage.length) + 1));
                }
                tokens[tokens.length -1].setLine(line);

        });

        //error handler for unbalanced brackets
            let level = 0;
            let brackets: {index: number, char: string}[] = [];

            for (let i = 0; i < this.data.length; i++) {
                let char = this.data.split("")[i];
                    if (char == "{") {
                        level++; 
                        brackets.push({index: i, char});
                    } else if (char == "}") {
                        level--;
                        brackets.push({index: i, char});
                    }

                
            }

            if (level != 0) {
                for (let i = 0; i < brackets.length; i++) {
                        let bracket = brackets[i];
                        if (bracket.char == "{") {
                                let closingBracket = findMatching(brackets.map((b) => b.char).join(""), i, ["{", "}"]);

                                if (closingBracket != -1) brackets = brackets.filter((b) => ![bracket.index, closingBracket.index].includes(b.index));
                        } else if (bracket.char == "}") {
                                let openingBracket = findMatching(brackets.map((b) => b.char).join(""), i, ["}", "{"]);

                                if (openingBracket != -1) brackets = brackets.filter((b) => ![bracket.index, openingBracket.index].includes(b.index));
                        }
                }

                for (let i = 0; i < brackets.length; i++) {
                        let bracket = brackets[i];
                        let line = 0;
                        let char = 0;
                        for (let i = 0; i < tokens.length; i++) {
                                let nextToken = tokens[i + 1];
                                
                                if (bracket.index < nextToken.startIndex) {
                                        line = i + 1;
                                        char = (bracket.index - tokens[i].startIndex)+1;
                                        break;
                                }
        
        
                        }
                        logger.sendError("CompilerError: Found unbalanced bracket at line " + (line) + " character " + (char));
                        return 1;

            }
        }
        //ends here


        //parsing of tokens
        for (let token of tokens) {
                for (const definition of this.regexes.definitions) {
                        const regexes = definition.regexes;
                        const type = definition.type;
                        for (const regex of regexes) {
                                const matches = token.storage.match(regex);

                                if (matches) {
                                        for (const match of matches) {
                                                if (type == "function") {
                                                        let data = regex.exec(match);
                                                        if (!data) data = regex.exec(match);

                                                        const name = data?.groups.name;
                                                        let argsArray = data?.groups.args?.split(",").map((arg) => arg.trim());

                                                        let args: {[key: string]: string}[] = [];
                                                        
                                                        argsArray.forEach((arg) => {
                                                                let argName = arg.split(":")[0]?.trim();
                                                                let argType = arg.split(":")[1]?.trim();
                                                                args.push({[argName]: argType});
                                                        });

                                                        const bodyStart = this.data.indexOf("{", token.startIndex);
                                                        const bodyEnd = findMatching(this.data, bodyStart, ["{", "}"]);

                                                        const body = this.data.substring(bodyStart + 1, bodyEnd-1);

                                                        const func: FunctionType = {
                                                                name,
                                                                args,
                                                                body,
                                                                filePath: name.split("::").join("/"), //(functionName:functionName[0]/functionName[1]
                                                        };


                                                        this.parsed.functions.push(func);
                                                } else if (type == "variable") {
                                                        let data = regex.exec(match);
                                                        if (!data) data = regex.exec(match);

                                                        const name = data?.groups.name;
                                                        const type = data?.groups.type;
                                                        const value = data?.groups.value;


                                                        //define scope

                                                        this.parsed.functions.forEach((func) => {
                                                                let funcData = regex.exec(func.body);
                                                                if (!funcData) funcData = regex.exec(func.body);

                                                                funcData.groups.value = funcData?.groups.value?.trim();
                                                                let setOfValues = new Set([...Object.values(funcData?.groups),...Object.values(data?.groups)]);

                                                                if (setOfValues.size == 3) {
                                                                        (func.localVariables as VariableType[]).push({
                                                                                name,
                                                                                type, 
                                                                                value
                                                                        });
                                                                        data.groups.name = func.name + "::" + data?.groups.name;
                                                                }
                                                        });
                                                        //ends here

                                                        const variable: VariableType = {
                                                                name,
                                                                type,
                                                                value
                                                        };

                                                        (this.parsed.variables as VariableType[]).push(variable);

                                                } else if (type == "functioncall") {
                                                        let data = regex.exec(match);
                                                        if (!data) data = regex.exec(match);

                                                        const name = data?.groups.name;
                                                        let args = data?.groups.args?.split(",").map((arg) => arg.trim());


                                                        if (!this.parsed.functions.map((func) => func.name).includes(name)) {
                                                                logger.sendError("CompilerError: Function " + name + " is not defined");
                                                                return 1;
                                                        }


                                                }
                                        }
                                }
                        }
                }
        }
        if ((await Client.getInstance())?.inDir) (await Client.getInstance()).postParsedData(this.parsed);
    
        return this;
        }

}

function findMatching(str, pos, brackets: string[]) {
    if (str[pos] !== brackets[0]) {
      throw new Error('The position must contain an opening bracket');
    }
    let level = 1;
    for (let index = pos + 1; index < str.length; index++) {
      if (str[index] === brackets[0]) {
        level++;
      } else if (str[index] === brackets[1]) {
        level--;
      }
      
      if (level === 0) {
        return index;
      }
    }
    return -1;
  }

  class Token {
        public startIndex: number;
        public storage: string;

        constructor(startIndex: number) {
                this.startIndex = startIndex;
                this.storage = "";
                }


        toString() {
                return `startIndex: ${this.startIndex}, storage: ${this.storage}`;
        };

        addChar(char: string) {
                this.storage += char;
        }

        setLine(line: string) {
                this.storage = line;
        }

  }