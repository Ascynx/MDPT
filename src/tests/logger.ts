export class Logger {
    private static instance: Logger;
    private isDebug: boolean = false;

    private constructor(isDebug: boolean = false) {
        this.isDebug = isDebug;
    }


    public static getInstance(isDebug?: boolean): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(isDebug);
        }

        return Logger.instance;
    }

    public setDebug(isDebug: boolean): void {
        this.isDebug = isDebug;
    };

    public sendMessage(message: string): void {
        if (this.isDebug) console.log("[DEBUG/INFO] " + message);
        console.log(`[${new Date().toLocaleTimeString()}/INFO] ${message}`);
    }

    public sendError(message: string): void {
        if (this.isDebug) console.log("[DEBUG/ERROR] " + message);
        console.error(`[${new Date().toLocaleTimeString()}/ERROR] ${message}`);
    }

    public sendWarning(message: string): void {
        if (this.isDebug) console.log("[DEBUG/WARNING] " + message);
        console.warn(`[${new Date().toLocaleTimeString()}/WARNING] ${message}`);
    }

    public sendDebug(message: string): void {
        if (this.isDebug) console.log(`[${new Date().toLocaleTimeString()}/DEBUG] ${message}`);
    }//only sends if the logger was instantiated with debug enabled
}