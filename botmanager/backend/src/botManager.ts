import * as fs from "fs";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

interface Bot {
    id: number;
    username: string;
    email: string;
    password: string;
    active: boolean;
}

class BotManager {
    private bots: Bot[] = [];
    // Cookie jars per bot zur Persistierung der Session
    private cookieJars: { [botId: number]: CookieJar } = {};

    constructor() {
        this.loadBots();
    }

    private loadBots() {
        try {
            const data = fs.readFileSync("bots.json", "utf-8");
            this.bots = JSON.parse(data);
            // Initialisiere für jeden geladenen Bot einen CookieJar
            for (const bot of this.bots) {
                if (!this.cookieJars[bot.id]) {
                    this.cookieJars[bot.id] = new CookieJar();
                }
            }
            console.log("[BotManager] Bots loaded:", this.bots);
        } catch (error) {
            console.error("❌ [BotManager] Error loading bots:", error);
            this.bots = [];
        }
    }

    private saveBots() {
        fs.writeFileSync("bots.json", JSON.stringify(this.bots, null, 2));
    }

    private logActivity(activity: string) {
        const logEntry = `[${new Date().toISOString()}] ${activity}\n`;
        fs.appendFileSync("logs.txt", logEntry);
        console.log("[BotManager] Log:", logEntry.trim());
    }

    // Liefert einen axios-Client mit dem CookieJar für einen bestimmten Bot
    private getClient(botId: number): AxiosInstance {
        if (!this.cookieJars[botId]) {
            this.cookieJars[botId] = new CookieJar();
        }
        return wrapper(axios.create({ jar: this.cookieJars[botId], withCredentials: true }));
    }

    /**
     * InitBots:
     * - Lädt zuerst vorhandene Bots aus bots.json.
     * - Wenn die vorhandene Anzahl kleiner als 'requestedCount' ist,
     *   werden neue Bots über den Registration-Endpoint erstellt.
     * - Danach werden die ersten 'requestedCount' Bots für das Login verwendet.
     */
    async initBots(requestedCount: number) {
        // Lade vorhandene Bots
        this.loadBots();
        let availableCount = this.bots.length;
        console.log(`[BotManager] Available bots in file: ${availableCount}`);

        // Falls nicht genug Bots vorhanden sind, erstelle zusätzliche Bots
        if (availableCount < requestedCount) {
            const botsToCreate = requestedCount - availableCount;
            console.log(`[BotManager] Need to create ${botsToCreate} new bots via registration.`);
            for (let i = 0; i < botsToCreate; i++) {
                const newId = availableCount + i + 1;
                // Generiere eindeutige Daten für den neuen Bot
                const newBotData: Bot = {
                    id: newId,
                    username: `bot${newId}`,
                    email: `bot${newId}@example.com`,
                    password: `password${newId}`,
                    active: false,
                };

                // Versuche, den Bot über den Registrierung-Endpoint zu registrieren
                try {
                    // Nutze einen temporären axios-Client ohne CookieJar, da noch kein Konto existiert
                    const regResponse = await axios.post(
                        "http://localhost:8088/auth/register",
                        {
                            username: newBotData.username,
                            email: newBotData.email,
                            password: newBotData.password,
                        },
                        { withCredentials: true }
                    );
                    console.log(`[BotManager] Registered new bot: ${newBotData.username}`, regResponse.data);
                    // Füge den neuen Bot zur Liste hinzu
                    this.bots.push(newBotData);
                    this.cookieJars[newBotData.id] = new CookieJar();
                } catch (error: any) {
                    console.error(`[BotManager] Failed to register bot ${newBotData.username}:`, error.response?.data || error.message);
                    // Falls Registrierung fehlschlägt, kannst du den Bot trotzdem hinzufügen (evtl. mit active=false)
                    this.bots.push(newBotData);
                    this.cookieJars[newBotData.id] = new CookieJar();
                }
            }
            // Aktualisiere die Anzahl
            availableCount = this.bots.length;
            this.saveBots();
        }

        // Verwende die ersten 'requestedCount' Bots
        const botsToInit = this.bots.slice(0, requestedCount);
        console.log(`[BotManager] Initializing ${botsToInit.length} bots...`);

        // Für jeden Bot Login durchführen
        for (const bot of botsToInit) {
            try {
                const client = this.getClient(bot.id);
                const response = await client.post(
                    "http://localhost:8088/auth/login",
                    { email: bot.email, password: bot.password }
                );
                console.log(`[BotManager] ${bot.username} login response:`, response.data);
                bot.active = true;
                this.logActivity(`${bot.username} logged in successfully during init.`);
            } catch (error: any) {
                console.error(`[BotManager] ${bot.username} failed to login during init:`, error.response?.data || error.message);
                this.logActivity(`${bot.username} failed to login during init: ${error.response?.data || error.message}`);
                bot.active = false;
            }
        }
        // Aktualisiere die bots.json (ggf. werden jetzt mehr als requestedCount Bots gespeichert)
        this.saveBots();
    }

    getBots() {
        return this.bots;
    }

    // Like a video (Single Bot)
    async likeVideo(botId: number, videoId: string) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) {
            console.error(`[BotManager] ❌ Bot ${botId} not found`);
            return;
        }
        console.log(`[BotManager] 👍 ${bot.username} liking video ${videoId}...`);
        try {
            const client = this.getClient(bot.id);
            await client.post(`http://localhost:8088/videos/${videoId}/like`, {});
            this.logActivity(`${bot.username} liked video ${videoId}`);
        } catch (error: any) {
            console.error(`[BotManager] ❌ ${bot.username} failed to like video:`, error.response?.data || error.message);
            this.logActivity(`${bot.username} failed to like video ${videoId}: ${error.response?.data || error.message}`);
        }
    }

    // Comment on a video (Single Bot)
    async commentVideo(botId: number, videoId: string, comment: string) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) {
            console.error(`[BotManager] ❌ Bot ${botId} not found`);
            return;
        }
        // Falls der Kommentar ein Sternchen ist, wähle einen zufälligen vordefinierten Kommentar
        const predefinedComments = [
            "Great video!",
            "Awesome content!",
            "Loved it, keep it up!",
            "Very informative!",
            "Thanks for sharing!"
        ];
        if (comment.trim() === "*") {
            comment = predefinedComments[Math.floor(Math.random() * predefinedComments.length)];
            console.log(`[BotManager] Random comment chosen for ${bot.username}: ${comment}`);
        }
        console.log(`[BotManager] 💬 ${bot.username} commenting on video ${videoId}: "${comment}"...`);
        try {
            const client = this.getClient(bot.id);
            const response = await client.post(
                "http://localhost:8088/comments",
                { videoId, content: comment }
            );
            console.log(`[BotManager] ✅ Response from KevTube for comment:`, response.data);
            this.logActivity(`${bot.username} commented on video ${videoId}: "${comment}"`);
        } catch (error: any) {
            console.error(`[BotManager] ❌ ${bot.username} failed to comment:`, error.response?.data || error.message);
            this.logActivity(`${bot.username} failed to comment on video ${videoId}: ${error.response?.data || error.message}`);
        }
    }

    // Toggle Bot Activation: Bei Aktivierung wird ein Login ausgeführt, bei Deaktivierung ein Logout
    async toggleBot(botId: number) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) {
            console.error(`[BotManager] ❌ Bot ${botId} not found`);
            return;
        }
        const client = this.getClient(bot.id);
        if (!bot.active) {
            try {
                const response = await client.post("http://localhost:8088/auth/login", { email: bot.email, password: bot.password });
                console.log(`[BotManager] 🔐 ${bot.username} login response (toggle):`, response.data);
                bot.active = true;
                this.logActivity(`${bot.username} logged in successfully.`);
            } catch (error: any) {
                console.error(`[BotManager] ❌ ${bot.username} failed to login (toggle):`, error.response?.data || error.message);
                this.logActivity(`${bot.username} failed to login: ${error.response?.data || error.message}`);
            }
        } else {
            try {
                const response = await client.post("http://localhost:8088/auth/logout", {});
                console.log(`[BotManager] 🔓 ${bot.username} logout response (toggle):`, response.data);
                bot.active = false;
                this.logActivity(`${bot.username} logged out successfully.`);
            } catch (error: any) {
                console.error(`[BotManager] ❌ ${bot.username} failed to logout:`, error.response?.data || error.message);
                this.logActivity(`${bot.username} failed to logout: ${error.response?.data || error.message}`);
            }
        }
        this.saveBots();
    }
}

export default BotManager;
