import React, { useState, useEffect } from "react";
import axios from "axios";

interface Bot {
    id: number;
    username: string;
    active: boolean;
}

const App: React.FC = () => {
    const [bots, setBots] = useState<Bot[]>([]);
    const [videoId, setVideoId] = useState("");
    const [comment, setComment] = useState("");
    const [logs, setLogs] = useState<string[]>([]);

    // ✅ Fetch logs from backend every 3 seconds
    useEffect(() => {
        const fetchLogs = () => {
            axios.get("http://localhost:8888/logs")
                .then((res) => setLogs(res.data.logs))
                .catch((err) => console.error("❌ Error fetching logs:", err));
        };

        fetchLogs(); // Initial fetch
        const interval = setInterval(fetchLogs, 3000); // Refresh logs every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // ✅ Fetch bots from backend
    useEffect(() => {
        axios.get("http://localhost:8888/bots")
            .then((res) => setBots(res.data))
            .catch((err) => console.error("❌ Error fetching bots:", err));
    }, []);

    // ✅ Init Bots (Ask how many, fetch from backend)
    const initBots = () => {
        const count = parseInt(prompt("How many bots to create? (Max 10)", "1") || "0");
        if (count < 1 || count > 10) return alert("Enter a number between 1 and 10!");

        axios.post("http://localhost:8888/bots/init", { count })
            .then((res) => {
                console.log(`✅ Created ${count} bots`);
                setBots(res.data);
            })
            .catch((err) => console.error("❌ Error creating bots:", err));
    };

    // ✅ Like Video (Single Bot)
    const likeVideo = (botId: number) => {
        if (!videoId) return alert("Enter a video ID!");
        axios.post("http://localhost:8888/bots/like", { botId, videoId })
            .then(() => console.log(`✅ Bot ${botId} liked video ${videoId}`))
            .catch((err) => console.error("❌ Error liking video:", err));
    };

    // ✅ Comment on Video (Single Bot)
    const commentVideo = (botId: number) => {
        if (!videoId || !comment) return alert("Enter a video ID and comment!");
        axios.post("http://localhost:8888/bots/comment", { botId, videoId, comment })
            .then(() => console.log(`✅ Bot ${botId} commented on video ${videoId}`))
            .catch((err) => console.error("❌ Error commenting on video:", err));
    };

    // ✅ View Video (Single Bot)
    const viewVideo = (videoId: string) => {
        if (!videoId) return alert("Enter a video ID!");
        window.open(`http://localhost:8008/video/${videoId}`, "_blank");
    };

    // ✅ All Bots Like Video
    const allBotsLike = () => {
        if (!videoId) return alert("Enter a video ID!");
        axios.post("http://localhost:8888/bots/all/like", { videoId })
            .then(() => console.log(`✅ All active bots liked video ${videoId}`))
            .catch((err) => console.error("❌ Error liking video with all bots:", err));
    };

    // ✅ All Bots Comment on Video
    const allBotsComment = () => {
        if (!videoId || !comment) return alert("Enter a video ID and comment!");
        axios.post("http://localhost:8888/bots/all/comment", { videoId, comment })
            .then(() => console.log(`✅ All active bots commented on video ${videoId}`))
            .catch((err) => console.error("❌ Error commenting on video with all bots:", err));
    };

    // ✅ All Bots View Video
    const allBotsView = () => {
        if (!videoId) return alert("Enter a video ID!");
        bots.filter(bot => bot.active).forEach(() => viewVideo(videoId));
    };

    // ✅ Toggle Bot Activation
    const toggleBot = (botId: number) => {
        axios.post(`http://localhost:8888/bots/toggle/${botId}`)
            .then(() => {
                setBots(prevBots =>
                    prevBots.map(bot =>
                        bot.id === botId ? { ...bot, active: !bot.active } : bot
                    )
                );
            })
            .catch((err) => console.error("❌ Error toggling bot:", err));
    };

    // ✅ Count Active Bots
    const activeBotsCount = bots.filter(bot => bot.active).length;

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "#fbfbfb" }}>
            {/* LEFT: Main Bot Manager UI */}
            <div style={{ flex: 2, padding: "20px", fontFamily: "Arial" }}>
                <h1>🤖 KevTube Botmanager</h1>
                <button onClick={initBots}>➕ Init Bots</button>

                <h2>All Bots Actions (Active Bots: {activeBotsCount})</h2>
                <input
                    type="text"
                    placeholder="Enter Video ID"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    style={{ marginRight: "10px", width: "150px" }}
                />
                <button onClick={allBotsLike}>👍 All Bots Like</button>
                <input
                    type="text"
                    placeholder="Enter Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ marginLeft: "10px", width: "150px" }}
                />
                <button onClick={allBotsComment}>💬 All Bots Comment</button>
                <button onClick={allBotsView}>🎥 All Bots View</button>

                <h2>Bots:</h2>
                {bots.length === 0 ? <p>No bots initialized yet.</p> : (
                    <ul>
                        {bots.map((bot) => (
                            <li key={bot.id} style={{ marginBottom: "10px" }}>
                                <strong>{bot.username}</strong>
                                <span style={{
                                    display: "inline-block",
                                    width: "10px", height: "10px",
                                    backgroundColor: bot.active ? "green" : "red",
                                    borderRadius: "50%", marginLeft: "10px",marginRight: "10px"
                                }}></span>

                                {/* Toggle Bot Button */}
                                <button
                                    onClick={() => toggleBot(bot.id)}
                                    style={{
                                        minWidth: "120px", // 🔥 Ensure both buttons are same size
                                        textAlign: "center",
                                        padding: "5px"
                                    }}
                                >
                                    {bot.active ? "Deactivate" : "Activate"}
                                </button>

                                {/* Video ID Input for each bot */}
                                <input
                                    type="text"
                                    placeholder="Video ID"
                                    onChange={(e) => setVideoId(e.target.value)}
                                    style={{ marginLeft: "10px", width: "100px" }}
                                    disabled={!bot.active}
                                />

                                {/* Buttons for each bot */}
                                <button onClick={() => likeVideo(bot.id)} disabled={!bot.active}>👍 Like</button>
                                <input
                                    type="text"
                                    placeholder="Comment"
                                    onChange={(e) => setComment(e.target.value)}
                                    style={{ marginLeft: "10px", width: "120px" }}
                                    disabled={!bot.active}
                                />
                                <button onClick={() => commentVideo(bot.id)} disabled={!bot.active}>💬 Comment</button>
                                <button onClick={() => viewVideo(videoId)} disabled={!bot.active}>🎥 View</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {/* RIGHT: Logs Panel */}
            <div style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                padding: "20px",
                borderLeft: "2px solid #ccc",
                overflowY: "auto"
            }}>
                <h2>📜 Logs</h2>
                <div style={{
                    height: "85%",
                    overflowY: "auto",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap"
                }}>
                    {logs.length === 0 ? <p>No logs available.</p> : (
                        logs.map((log, index) => <p key={index}>{log}</p>)
                    )}
                </div>
            </div>

        </div>
    );
};

export default App;
