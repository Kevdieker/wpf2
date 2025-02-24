import React, { useState, useEffect } from "react";
import axios from "axios";

interface Bot {
    id: number;
    username: string;
    active: boolean;
}

interface Video {
    id: number;
    title: string;
    thumbnailUrl?: string;
}

const App: React.FC = () => {
    const [bots, setBots] = useState<Bot[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [videoId, setVideoId] = useState("");
    const [comment, setComment] = useState("");
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const fetchLogs = () => {
            axios
                .get("http://localhost:8888/logs")
                .then((res) => {
                    setLogs(res.data.logs);
                })
                .catch((err) =>
                    console.error("[APP] Error fetching logs:", err.response?.data || err.message)
                );
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    // Bots vom Botmanager abrufen
    useEffect(() => {
        axios
            .get("http://localhost:8888/bots")
            .then((res) => {
                setBots(res.data);
            })
            .catch((err) =>
                console.error("[APP] Error fetching bots:", err.response?.data || err.message)
            );
    }, []);

    // Verfügbare Videos über den Botmanager abrufen
    useEffect(() => {
        axios
            .get("http://localhost:8888/videos")
            .then((res) => {
                setVideos(res.data);
            })
            .catch((err) =>
                console.error("[APP] Error fetching videos:", err.response?.data || err.message)
            );
    }, []);

    // Init Bots: Erzeugt Bots und loggt sie ein
    const initBots = () => {
        const count = parseInt(prompt("How many bots to create? (Max 10)", "1") || "0");
        if (count < 1 || count > 10) return alert("Enter a number between 1 and 10!");
        axios
            .post("http://localhost:8888/bots/init", { count })
            .then((res) => {
                setBots(res.data);
            })
            .catch((err) =>
                console.error("[APP] Error creating bots:", err.response?.data || err.message)
            );
    };

    // Single Bot: Like Video – Anfrage über den Botmanager an KevTube
    const likeVideo = (botId: number) => {
        if (!videoId) return alert("Enter a video ID!");
        axios
            .post("http://localhost:8888/bots/like", { botId, videoId }, { withCredentials: true })
            .then(() => console.log(`[APP] Bot ${botId} liked video ${videoId}`))
            .catch((err) =>
                console.error("[APP] Error liking video:", err.response?.data || err.message)
            );
    };

    const commentVideo = (botId: number) => {
        if (!videoId || !comment) return alert("Enter a video ID and comment!");
        axios
            .post("http://localhost:8888/bots/comment", { botId, videoId, comment }, { withCredentials: true })
            .then(() => console.log(`[APP] Bot ${botId} commented on video ${videoId}`))
            .catch((err) =>
                console.error("[APP] Error commenting on video:", err.response?.data || err.message)
            );
    };

    // Single Bot: View Video – Anfrage an den Botmanager, der KevTube aufruft
    const viewVideo = (videoId: string) => {
        if (!videoId) return alert("Enter a video ID!");
        axios
            .post("http://localhost:8888/bots/view", { videoId }, { withCredentials: true })
            .then(() => console.log(`[APP] Viewed video ${videoId}`))
            .catch((err) =>
                console.error("[APP] Error viewing video:", err.response?.data || err.message)
            );
    };

    // Alle aktiven Bots sollen liken
    const allBotsLike = () => {
        if (!videoId) return alert("Enter a video ID!");
        bots.filter(bot => bot.active).forEach(bot => likeVideo(bot.id));
    };

    // Alle aktiven Bots sollen kommentieren
    const allBotsComment = () => {
        if (!videoId || !comment) return alert("Enter a video ID and comment!");
        bots.filter(bot => bot.active).forEach(bot => commentVideo(bot.id));
    };

    // Alle aktiven Bots sollen das Video viewen
    const allBotsView = () => {
        if (!videoId) return alert("Enter a video ID!");
        bots.filter(bot => bot.active).forEach(bot => viewVideo(videoId));
    };

    // Toggle Bot Activation – ruft /bots/toggle/:id auf
    const toggleBot = (botId: number) => {
        axios
            .post(`http://localhost:8888/bots/toggle/${botId}`)
            .then(() => {
                setBots(prevBots =>
                    prevBots.map(bot =>
                        bot.id === botId ? { ...bot, active: !bot.active } : bot
                    )
                );
            })
            .catch((err) =>
                console.error("[APP] Error toggling bot:", err.response?.data || err.message)
            );
    };

    const activeBotsCount = bots.filter(bot => bot.active).length;

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "#fbfbfb" }}>
            <div style={{ flex: 2, padding: "20px", fontFamily: "Arial" }}>
                <h1>KevTube Botmanager</h1>
                <button onClick={initBots}>➕ Init Bots</button>

                <h2>Available Videos:</h2>
                {videos.length === 0 ? (
                    <p>No videos available.</p>
                ) : (
                    <ul>
                        {videos.map(video => (
                            <li key={video.id}>
                                ID: {video.id} - {video.title}
                            </li>
                        ))}
                    </ul>
                )}

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
                {bots.length === 0 ? (
                    <p>No bots initialized yet.</p>
                ) : (
                    <ul>
                        {bots.map((bot) => (
                            <li key={bot.id} style={{ marginBottom: "10px" }}>
                                <strong>{bot.username}</strong>
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: bot.active ? "green" : "red",
                                        borderRadius: "50%",
                                        marginLeft: "10px",
                                        marginRight: "10px",
                                    }}
                                ></span>
                                <button
                                    onClick={() => toggleBot(bot.id)}
                                    style={{ minWidth: "120px", textAlign: "center", padding: "5px" }}
                                >
                                    {bot.active ? "Deactivate" : "Activate"}
                                </button>
                                <button onClick={() => likeVideo(bot.id)} disabled={!bot.active}>
                                    👍 Like
                                </button>
                                <button onClick={() => commentVideo(bot.id)} disabled={!bot.active}>
                                    💬 Comment
                                </button>
                                <button onClick={() => viewVideo(videoId)} disabled={!bot.active}>
                                    🎥 View
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {/* RIGHT: Logs Panel */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: "#f0f0f0",
                    padding: "20px",
                    borderLeft: "2px solid #ccc",
                    overflowY: "auto",
                }}
            >
                <h2>📜 Logs</h2>
                <div
                    style={{
                        height: "85%",
                        overflowY: "auto",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {logs.length === 0 ? (
                        <p>No logs available.</p>
                    ) : (
                        logs.map((log, index) => <p key={index}>{log}</p>)
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
