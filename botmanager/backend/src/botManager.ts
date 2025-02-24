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
            // Initialisiere für jeden geladenen Bot einen Cookie Jar
            for (const bot of this.bots) {
                this.cookieJars[bot.id] = new CookieJar();
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

    // Hilfsmethode: Liefert einen axios-Client mit dem CookieJar für einen bestimmten Bot
    private getClient(botId: number): AxiosInstance {
        if (!this.cookieJars[botId]) {
            this.cookieJars[botId] = new CookieJar();
        }
        return wrapper(axios.create({ jar: this.cookieJars[botId], withCredentials: true }));
    }

    // Init Bots: Erzeugt die Bots neu und loggt sie bei KevTube (Port 8088) ein
    async initBots(count: number) {
        this.bots = [];
        this.cookieJars = {};
        for (let i = 0; i < count; i++) {
            const bot: Bot = {
                id: i + 1,
                username: i === 0 ? "kevin" : `user${i}`,
                email: i === 0 ? "test@test" : `user${i}@example.com`,
                password: i === 0 ? "test" : `password${i}`,
                active: false,
            };
            this.bots.push(bot);
            this.cookieJars[bot.id] = new CookieJar();
        }
        this.saveBots();

        // Login für jeden Bot bei KevTube (Port 8088)
        for (const bot of this.bots) {
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
            // POST an /videos/:id/like
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
            // Bot aktivieren: Login
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
            // Bot deaktivieren: Logout
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
