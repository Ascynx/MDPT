import * as fs from 'fs';

export const getPackage = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${process.cwd()}/package.json`, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

export const getFileData = (filePath: string) => {
    return fs.readFileSync(filePath, "utf8");
}
