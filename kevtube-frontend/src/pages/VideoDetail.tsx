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

    const API_URL = "http://localhost:8088";

    // Fetch Video Details
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
        axios.get(`${API_URL}/auth/me`, { withCredentials: true })
            .then(response => {
                if (response.data?.username) {
                    setUser({ username: response.data.username });
                }
            })
            .catch(() => setUser(null));
    }, []);

    const handleLogin = async () => {
        const email = prompt("Enter your email:");
        const password = prompt("Enter your password:");
        if (!email || !password) return;
        try {
            await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
            const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
            setUser(response.data);
        } catch (error) {
            alert("Login failed! ❌");
        }
    };

    const handleLogout = async () => {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    const toggleLike = async () => {
        if (!video) return;
        if (!user) {
            setShowLoginPopup(true);
            return;
        }
        try {
            const url = video.userHasLiked
                ? `${API_URL}/videos/${id}/unlike`
                : `${API_URL}/videos/${id}/like`;
            const response = await axios.post(url, {}, { withCredentials: true });
            setVideo(response.data);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

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

            {/* Zusätzliche Informationen: Beschreibung und Transkript */}


            {/* Video Player */}
            <div className="video-player">
                {video.videoUrl ? (
                    <video ref={videoRef} controls width="100%" height="auto">
                        <source src={video.videoUrl} type="video/mp4"/>
                    </video>
                ) : (
                    <p>No video available</p>
                )}
            </div>

            {/* Like & Views Section */}
            <div className="video-meta">
                <div className="views">👁️ {video.views.toLocaleString()} Views</div>
                <div className="likes">❤️ {video.likes} Likes</div>
            </div>

            <button className={`like-btn ${video.userHasLiked ? "liked" : ""}`} onClick={toggleLike} disabled={!user}>
                {video.userHasLiked ? "💔 Unlike" : "❤️ Like"}
            </button>
            <p><strong>Description:</strong> {video.description || "No description available."}</p>
            <p><strong>Transcript:</strong> {video.transcript || "No transcript available."}</p>
            {/* Comments Section */}
            <h2>💬 Comments</h2>
            {user && (
                <div className="add-comment-section">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add your comment..."/>
                    <button onClick={submitComment} disabled={!newComment.trim()}>Post Comment</button>
                </div>
            )}

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
