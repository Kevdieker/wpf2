import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import BotManager from "./botManager";

dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:3000"
    ,
    credentials: true
}));

app.use(express.json());
console.log("✅ Loaded ENV Port:", process.env.PORT);

const botManager = new BotManager();

// GET: Liste der Bots (mit Login-Status)
app.get("/bots", (req, res) => {
    console.log("[Server] GET /bots called");
    res.json(botManager.getBots());
});

// POST: Init Bots (erstellt Bots und loggt sie bei KevTube ein)
app.post("/bots/init", async (req, res) => {
    console.log("[Server] POST /bots/init called with body:", req.body);
    const { count } = req.body;
    await botManager.initBots(count);
    res.json(botManager.getBots());
});

// POST: Like a video (Single Bot)
app.post("/bots/like", async (req, res) => {
    console.log("[Server] POST /bots/like called with body:", req.body);
    const { botId, videoId } = req.body;
    await botManager.likeVideo(botId, videoId);
    res.send({ message: `Bot ${botId} liked video ${videoId}` });
});

// POST: Comment on a video (Single Bot)
app.post("/bots/comment", async (req, res) => {
    console.log("[Server] POST /bots/comment called with body:", req.body);
    const { botId, videoId, comment } = req.body;
    await botManager.commentVideo(botId, videoId, comment);
    res.send({ message: `Bot ${botId} commented on video ${videoId}` });
});

// POST: Toggle Bot Activation (führt Login/Logout bei KevTube aus)
app.post("/bots/toggle/:id", async (req, res) => {
    console.log("[Server] POST /bots/toggle called for botId:", req.params.id);
    const botId = Number(req.params.id);
    await botManager.toggleBot(botId);
    res.send({ message: `Bot ${botId} toggled` });
});

// POST: View Video – ruft den KevTube-Endpoint zum Erhöhen der Views auf
app.post("/bots/view", async (req, res) => {
    console.log("[Server] POST /bots/view called with body:", req.body);
    const { videoId } = req.body;
    if (!videoId) {
        res.status(400).send({ message: "Enter a video ID" });
    }
    try {
        // GET /videos/:id ruft den KevTube-Endpoint auf, der Views erhöht und Videodaten zurückgibt
        const response = await axios.get(`http://localhost:8088/videos/${videoId}`, { withCredentials: true });
        console.log("[Server] GET /videos/:id response:", response.data);
        res.send({ message: `Video ${videoId} viewed`, data: response.data });
    } catch (error: any) {
        console.error("[Server] ❌ Error viewing video:", error.response?.data || error.message);
        res.status(500).send({ message: "Error viewing video", error: error.response?.data || error.message });
    }
});

// GET: Verfügbare Videos – ruft Videos vom KevTube-Backend über den Botmanager ab
app.get("/videos", async (req, res) => {
    console.log("[Server] GET /videos called");
    try {
        const response = await axios.get("http://localhost:8088/videos", { withCredentials: true });
        console.log("[Server] GET /videos response:", response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error("[Server] ❌ Error fetching videos:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching videos" });
    }
});

// GET: Logs aus logs.txt auslesen und an das Frontend liefern
app.get("/logs", (req, res) => {
    console.log("[Server] GET /logs called");
    try {
        const logsData = fs.readFileSync("logs.txt", "utf-8");
        const logsArray = logsData.split("\n").filter(line => line.trim() !== "");
        res.json({ logs: logsArray });
    } catch (error) {
        console.error("[Server] ❌ Error reading logs.txt:", error);
        res.status(500).json({ logs: [] });
    }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
