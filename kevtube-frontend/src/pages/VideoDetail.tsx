import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/App.css";
import { VideoToDetailspageDto } from "../dto/VideoToDetailspageDto.ts";

const VideoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<VideoToDetailspageDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>("");
    const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [user, setUser] = useState<{ username: string } | null>(null);

    const API_URL = "http://localhost:8088"; // ✅ Backend URL

// ✅ Fetch Video Details
    useEffect(() => {
        axios.get(`${API_URL}/videos/${id}`, { withCredentials: true })
            .then((res) => {
                setVideo(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching video:", error);
                setError("Failed to load video.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        axios.get('http://localhost:8088/auth/me', { withCredentials: true })
            .then(response => {
                if (response.data?.username) {
                    setUser({ username: response.data.username });
                }
            })
            .catch(() => setUser(null));
    }, []);




    // ✅ Handle Login
    const handleLogin = async () => {
        const email = prompt("Enter your email:");
        const password = prompt("Enter your password:");

        if (!email || !password) return;

        try {
            await axios.post('http://localhost:8088/auth/login', { email, password }, { withCredentials: true });
            const response = await axios.get('http://localhost:8088/auth/me', { withCredentials: true });
            setUser(response.data); // ✅ Store user data
        } catch (error) {
            alert("Login failed! ❌");
        }
    };


    // ✅ Logout function
    const handleLogout = async () => {
        await axios.post('http://localhost:8088/auth/logout', {}, { withCredentials: true });
        setUser(null); // ✅ Clear user data
    };

    // ✅ Toggle Like / Unlike
    const toggleLike = async () => {
        if (!video) return;
        if (!user) {  // Prüfe, ob der User eingeloggt ist
            setShowLoginPopup(true);
            return;
        }

        try {
            const url = video.userHasLiked
                ? `${API_URL}/videos/${id}/unlike`  // ✅ Unlike endpoint
                : `${API_URL}/videos/${id}/like`;   // ✅ Like endpoint

            const response = await axios.post(url, {}, { withCredentials: true });

            setVideo(response.data);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };


    // ✅ Submit Comment
    const submitComment = async () => {
        if (!newComment.trim() || !video || !user) return;

        try {
            const response = await axios.post(`${API_URL}/comments`,
                { videoId: video.id, content: newComment },
                { withCredentials: true }
            );

            setVideo((prevVideo) => prevVideo ? { ...prevVideo, comments: [...prevVideo.comments, response.data] } : prevVideo);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    if (loading) return <p>Loading video details...</p>;
    if (error) return <p>{error}</p>;
    if (!video) return <p>Video not found.</p>;

    return (
        <div className="video-detail-container">
            {/* Header */}
            <header className="video-header">
                <a href="/" className="logo">KevTube</a>
                {user ? (
                    <button className="logout-btn" onClick={handleLogout}>Logout ({user.username})</button>
                ) : (
                    <button className="login-btn" onClick={handleLogin}>Login</button>
                )}
            </header>

            {/* Video Title */}
            <h1>{video.title}</h1>

            {/* Video Player */}
            <div className="video-player">
                {video.videoUrl ? (
                    <video ref={videoRef} controls width="100%" height="auto">
                        {!video.videoUrl.endsWith(".m3u8") && <source src={video.videoUrl} type="video/mp4" />}
                    </video>
                ) : (
                    <p>No video available</p>
                )}
            </div>

            {/* 📌 Separate Like & Views Section */}
            <div className="video-meta">
                <div className="views">👁️ {video.views.toLocaleString()} Views</div>
                <div className="likes">❤️ {video.likes} Likes</div>
            </div>

            {/* Like Button */}
            <button className={`like-btn ${video.userHasLiked ? "liked" : ""}`} onClick={toggleLike} disabled={!user}>
                {video.userHasLiked ? "💔 Unlike" : "❤️ Like"}
            </button>


            {/* Comments Section */}
            <h2>💬 Comments</h2>

            {/* Kommentar-Eingabe, wenn User eingeloggt */}
            {user && (
                <div className="add-comment-section">
        <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
        />
                    <button onClick={submitComment} disabled={!newComment.trim()}>
                        Post Comment
                    </button>
                </div>
            )}

            {/* Anzeige der Kommentare */}
            <div className="comments-list">
                {video.comments && video.comments.length > 0 ? (
                    video.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                            <strong>{comment.username}</strong>: {comment.content}
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>


            {/* 🟢 LOGIN POPUP */}
            {showLoginPopup && (
                <div className="login-popup">
                    <div className="login-popup-content">
                        <h2>Login</h2>
                        <p>You need to be logged in to like this video.</p>
                        <button onClick={handleLogin}>Login Now</button>
                        <button onClick={() => setShowLoginPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDetail;
