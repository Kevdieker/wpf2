import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

interface VideoSummary {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    uploadDate?: string;
    username: string;
    views: number;
}

const Home: React.FC = () => {
    const [videos, setVideos] = useState<VideoSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<{ username: string } | null>(null); // ✅ Track user

    const API_URL = 'http://localhost:8088/videos';

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get<VideoSummary[]>(API_URL);
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // ✅ Check if user is logged in
    useEffect(() => {
        axios.get('http://localhost:8088/auth/me', { withCredentials: true })
            .then(response => {
                if (response.data?.username) {
                    setUser({ username: response.data.username });
                }
            })
            .catch(() => setUser(null));
    }, []);

    // ✅ Login function
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

    return (
        <div className="App">
            <header className="App-header">
                <Link to="/" className="logo">KevTube</Link>
                {user ? (
                    <button className="logout-btn" onClick={handleLogout}>Logout ({user.username})</button>
                ) : (
                    <button className="login-btn" onClick={handleLogin}>Login</button>
                )}
            </header>

            {/* 🌟 Video-Grid Container */}
            <div className="video-container">
                {loading ? (
                    <p>Loading videos...</p>
                ) : (
                    <div className="video-list">
                        {videos.length > 0 ? (
                            videos.map((video) => (
                                <Link to={`/videos/${video.id}`} key={video.id} className="video-item">
                                    <div className="thumbnail-container">
                                        <img src={video.thumbnailUrl} alt={video.title} className="video-thumbnail" />
                                    </div>
                                    <h4 className="video-title">{video.title} </h4>
                                    <div className="video-info">
                                        <p>👤 {video.username}</p>
                                        <p>👁️ {video.views.toLocaleString()} views</p>
                                        <p>📅 {video.uploadDate ? new Date(video.uploadDate).toLocaleDateString() : "Unknown"}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No videos found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
