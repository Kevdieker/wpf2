import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming CSS is outside "pages" folder

interface VideoSummary {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    likes: number;
    commentCount: number;
}

const Home: React.FC = () => {
    const [videos, setVideos] = useState<VideoSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const API_URL = 'http://localhost:8008/videos';

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

    return (
        <div className="App">
            <header className="App-header">
                <h1>KevTube</h1>
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
                                    <h2 className="video-title">{video.title}</h2>
                                    <div className="video-info">
                                        <p>👍 {video.likes} Likes</p>
                                        <p>💬 {video.commentCount} Comments</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No videos found.</p>
                        )}
                    </div>
                )}
            </header>
        </div>
    );
};

export default Home;
