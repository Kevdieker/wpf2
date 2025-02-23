import * as fs from "fs";
import axios from "axios";

interface Bot {
    id: number;
    username: string;
    email: string;
    password: string;
    active: boolean; // ✅ New: Track active status
}

class BotManager {
    private bots: Bot[] = []; // ✅ Default value to avoid errors

    constructor() {
        this.loadBots();
    }

    // ✅ Load bots from bots.json
    private loadBots() {
        try {
            const data = fs.readFileSync("bots.json", "utf-8");
            this.bots = JSON.parse(data);
        } catch (error) {
            console.error("❌ Error loading bots:", error);
            this.bots = []; // ✅ Ensure it's always an array
        }
    }

    // ✅ Save bots to bots.json
    private saveBots() {
        fs.writeFileSync("bots.json", JSON.stringify(this.bots, null, 2));
    }

    // ✅ Log activity to logs.txt
    private logActivity(activity: string) {
        const logEntry = `[${new Date().toISOString()}] ${activity}\n`;
        fs.appendFileSync("logs.txt", logEntry);
    }

    // ✅ Init bots (Frontend requests bots)
    initBots(count: number) {
        this.bots = []; // Reset bots
        for (let i = 0; i < count; i++) {
            this.bots.push({
                id: i + 1,
                username: `Bot_${i + 1}`,
                email: `bot${i + 1}@example.com`,
                password: "secure123",
                active: true, // ✅ New bots start as active
            });
        }
        this.saveBots(); // Save new bots to file
    }

    // ✅ Get all bots
    getBots() {
        return this.bots;
    }

    // ✅ Like a video (Single Bot)
    async likeVideo(botId: number, videoId: string) {
        const bot = this.bots.find((b) => b.id === botId);
        if (!bot) return console.error(`❌ Bot ${botId} not found`);

        console.log(`👍 ${bot.username} liking video ${videoId}...`);
        try {
            await axios.put(`http://localhost:8008/video/${videoId}/like`);
            this.logActivity(`${bot.username} liked video ${videoId}`);
        } catch (error) {
            console.error(`❌ ${bot.username} failed to like video`, error);
        }
    }

    // ✅ Comment on a video (Single Bot)
    async commentVideo(botId: number, videoId: string, comment: string) {
        const bot = this.bots.find((b) => b.id === botId);
        if (!bot) return console.error(`❌ Bot ${botId} not found`);

        console.log(`💬 ${bot.username} commenting on video ${videoId}: "${comment}"...`);
        try {
            await axios.post(`http://localhost:8008/video/${videoId}/comment`, {
                userId: bot.id,
                content: comment,
            });
            this.logActivity(`${bot.username} commented on video ${videoId}: "${comment}"`);
        } catch (error) {
            console.error(`❌ ${bot.username} failed to comment`, error);
        }
    }

    // ✅ Toggle bot activation
    toggleBot(botId: number) {
        const bot = this.bots.find((b) => b.id === botId);
        if (!bot) return console.error(`❌ Bot ${botId} not found`);
        bot.active = !bot.active;
        this.saveBots();
        console.log(`🔄 Bot ${botId} is now ${bot.active ? "ACTIVE" : "INACTIVE"}`);
    }

}

export default BotManager;
