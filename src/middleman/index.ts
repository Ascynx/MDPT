import { ParsedData } from "../parser";

export class MiddlemanHandler {
    private static instance: MiddlemanHandler;
    private handlers: any[];
    private data: ParsedData;
    private endProduct: any;

    private constructor(data: ParsedData) {
        this.handlers = [];
        this.data = data;
    }

    public static getInstance(data?: ParsedData): MiddlemanHandler {
        if (!MiddlemanHandler.instance) {
            MiddlemanHandler.instance = new MiddlemanHandler(data);
        }

        return MiddlemanHandler.instance;
    }

    public registerHandler(handler: any) {
        this.handlers.push(handler);
    }

    public setData(data: ParsedData) {
        this.data = data;
        return this;
    }


    public runHandlers() {
        for (let i = 0; i < this.handlers.length; i++) {
            this.handlers[i].initializeModules();
            this.handlers[i].translate();
        }
    }

}