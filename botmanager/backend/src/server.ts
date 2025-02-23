import * as express from "express";
import * as cors from "cors";
import * as dotenv from "dotenv";
import BotManager from "./botManager";

dotenv.config(); // ✅ Load environment variables
const app = express();
app.use(cors());
app.use(express.json());
console.log("✅ Loaded ENV Port:", process.env.PORT);

const botManager = new BotManager();
// ✅ Get list of bots
app.get("/bots", (req, res) => {
    res.json(botManager.getBots());
});

// ✅ Init Bots (Frontend sends count, backend creates bots)
app.post("/bots/init", (req, res) => {
    const { count } = req.body;
    botManager.initBots(count);
    res.json(botManager.getBots()); // Return the newly created bots
});



// ✅ Like a video (Single Bot)
app.post("/bots/like", (req, res) => {
    const { botId, videoId } = req.body;
    botManager.likeVideo(botId, videoId);
    res.send({ message: `Bot ${botId} liked video ${videoId}` });
});

// ✅ Comment on a video (Single Bot)
app.post("/bots/comment", (req, res) => {
    const { botId, videoId, comment } = req.body;
    botManager.commentVideo(botId, videoId, comment);
    res.send({ message: `Bot ${botId} commented on video ${videoId}` });
});

// ✅ Toggle Bot Activation
app.post("/bots/toggle/:id", (req, res) => {
    const botId = Number(req.params.id);
    botManager.toggleBot(botId);
    res.send({ message: `Bot ${botId} toggled` });
});

// ✅ Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
