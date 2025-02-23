import * as fs from "fs";
import axios from "axios";

interface Bot {
    id: number;
    username: string;
    email: string;
    password: string;
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

    // ✅ Log activity to logs.txt
    private logActivity(activity: string) {
        const logEntry = `[${new Date().toISOString()}] ${activity}\n`;
        fs.appendFileSync("logs.txt", logEntry);
    }

    // ✅ Get all bots
    getBots() {
        return this.bots;
    }

    // ✅ Like a video
    async likeVideo(videoId: string) {
        this.bots.forEach(async (bot) => {
            console.log(`👍 ${bot.username} liking video ${videoId}...`);
            try {
                await axios.put(`http://localhost:8008/video/${videoId}/like`);
                this.logActivity(`${bot.username} liked video ${videoId}`);
            } catch (error) {
                console.error(`❌ ${bot.username} failed to like video`, error);
            }
        });
    }

    // ✅ Comment on a video
    async commentVideo(videoId: string, comment: string) {
        this.bots.forEach(async (bot) => {
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
        });
    }
}

export default BotManager;
