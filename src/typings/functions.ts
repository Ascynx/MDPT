export type FunctionType = {
    name: string,
    args: {
        [key: string]: string
    },
    body: string,
    filePath: string,
    transpiled?: string
    localVariables?: {name: string, data: any, type: string}[]
 }