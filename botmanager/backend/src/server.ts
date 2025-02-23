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

// ✅ Like a video
app.post("/bots/like", (req, res) => {
    const { videoId } = req.body;
    botManager.likeVideo(videoId);
    res.send({ message: `Bots liked video ${videoId}` });
});

// ✅ Comment on a video
app.post("/bots/comment", (req, res) => {
    const { videoId, comment } = req.body;
    botManager.commentVideo(videoId, comment);
    res.send({ message: `Bots commented on video ${videoId}` });
});

// ✅ Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
