//translates parsed mdp data for datapack project
import { ParsedData } from "../parser";
import { VariableType } from "../typings/variables";

export class Translator {
    private static instance: Translator;
    private modules: TranslatorModule[];
    private data: ParsedData;
    
    public translatedData;

    private constructor(data: ParsedData) {
        this.data = data;
        this.modules = [];
    };

    public static getInstance(ParsedData?: ParsedData): Translator {
        if (!Translator.instance) {
            Translator.instance = new Translator(ParsedData);
        }

        return Translator.instance;
    }

    public addModule(module: TranslatorModule) {
        this.modules.push(module.setClient(this));
    }

    public getModules() {
        return this.modules;

    }

    public setData(data: ParsedData) {
        this.data = data;
        return this;
    };

    public getData() {
        return this.data;
    }

    public initializeModules() {
        for (let module of this.modules) {
            module.switch(); //since on first activation they're offline it should switch on
        }
    }

    public translate() {
        for (const module of this.modules) {
            module.run(this.data);
        }
    }

}


// template for translator module
class TranslatorModule {
    public isOnline: boolean; //defines if the module is active or not, defaults to offline
    private client: Translator;

    public constructor(client?: Translator) {
        this.isOnline = false;
        this.client = client;
    }

    getClient() {
        return this.client;
    }

    setClient(client: Translator) {
        if (!this.client) this.client = client;

        return this;
    }//sets the client for the module

    public run(data: ParsedData): any {
        //PLACEHOLDER
    }

    public switch() {
        this.isOnline = !this.isOnline;

        return this;
    }

}

export class datapackDataTranslator extends TranslatorModule {
    private static instance: datapackDataTranslator;

    private constructor(client: Translator) {
        super(client);
    }

    public static getInstance(client?: Translator) {
        if (!datapackDataTranslator.instance) {
            datapackDataTranslator.instance = new datapackDataTranslator(client);
        }

        return datapackDataTranslator.instance;
    }


    /**
     * @override the run method of the parent class
     */
    public run(data: ParsedData): any {
        let newData = data;

        for (let i = 0; i < data.variables.length; i++) {
            let variable = (data.variables[i] as VariableType);

            if (variable.name == "_data") {
                if (variable.type == "name") data.datapackData.name = variable.value;
                if (variable.type == "pack_format") data.datapackData.pack_format = parseInt(variable.value);
                if (variable.type == "description") data.datapackData.description = variable.value;

                (newData.variables as any[]).filter((v, j) => j != i);
            }

        }

        return newData;
    }
}

export class functionTranslator extends TranslatorModule {
    private static instance: functionTranslator;

    private constructor(client: Translator) {
        super(client);
    }

    public static getInstance(client?: Translator) {
        if (!functionTranslator.instance) {
            functionTranslator.instance = new functionTranslator(client);
        }

        return functionTranslator.instance;
    }

    public run(data: ParsedData): any {
        let translated: string;

        for (let i = 0; i < data.functions.length; i++) {
            let func = data.functions[i];

            let localVariables = (func.localVariables as VariableType[]);

            for (let variable of localVariables) {
                if ((Object.keys(func.args)).includes(variable.name.split("::")[variable.name.split("::").length - 1])) {
                    //is an arg

                }
            }
        }

        return;
    }
}