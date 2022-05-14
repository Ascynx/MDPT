export type FunctionType = {
    name: string,
    args: Argument[],
    body: string,
    filePath: string,
    transpiled?: string
    localVariables?: {name: string, data: any, type: string}[]
 }

 export type Argument = {
     [key: string]: string
 }