import React, { useState, useEffect } from "react";
import axios from "axios";

interface Bot {
    id: number;
    username: string;
}

const App: React.FC = () => {
    const [bots, setBots] = useState<Bot[]>([]);
    const [videoId, setVideoId] = useState("");
    const [comment, setComment] = useState("");

    // ✅ Fetch Bots from Backend
    useEffect(() => {
        axios.get("http://localhost:8888/bots")
            .then((res) => setBots(res.data))
            .catch((err) => console.error("❌ Error fetching bots:", err));
    }, []);

    // ✅ Like Video
    const likeVideo = () => {
        axios.post("http://localhost:8888/bots/like", { videoId })
            .then(() => console.log("✅ Liked Video"))
            .catch((err) => console.error("❌ Error liking video:", err));
    };

    // ✅ Comment on Video
    const commentVideo = () => {
        axios.post("http://localhost:8888/bots/comment", { videoId, comment })
            .then(() => console.log("✅ Commented on Video"))
            .catch((err) => console.error("❌ Error commenting on video:", err));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>🤖 Bot Manager</h1>

            <h2>Bots:</h2>
            {bots.length === 0 ? <p>No bots found.</p> : (
                <ul>
                    {bots.map((bot) => (
                        <li key={bot.id}>{bot.username}</li>
                    ))}
                </ul>
            )}

            <h2>Bot Actions:</h2>
            <input
                type="text"
                placeholder="Enter Video ID"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                style={{ marginRight: "10px" }}
            />
            <button onClick={likeVideo}>👍 Like Video</button>

            <br /><br />

            <input
                type="text"
                placeholder="Enter Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ marginRight: "10px" }}
            />
            <button onClick={commentVideo}>💬 Comment on Video</button>
        </div>
    );
};

export default App;
