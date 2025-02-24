import * as fs from "fs";

const LOG_FILE = "logs.txt";

export function logActivity(message: string): void {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
}
