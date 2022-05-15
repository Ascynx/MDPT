import { VariableType, FileVariableType } from "./variables"

export type FunctionType = {
    name: string,
    args: Argument[],
    body: string,
    filePath: string,
    transpiled?: string,
    localVariables?: VariableType[] | FileVariableType[],
    calledAt?: {
        args: string[],
        filePath: string,
    }[]
 }

 export type Argument = {
     [key: string]: string
 }