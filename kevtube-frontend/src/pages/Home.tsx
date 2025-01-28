import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';  // Add this CSS file for the new styling

interface Comment {
    _id: string;
    userId: string;
    name: string;
    email: string;
    comment: string;
    date: string;
}

interface Video {
    _id: string;
    title: string;
    transcript: string;
    filePath: string;
    uploadDate: string;
    likes: number;
    comments: Comment[];
}

const App: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const API_URL = 'http://localhost:8008/videos';

    // Fetch videos from the API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get<Video[]>(API_URL);
                setVideos(response.data); // Set videos to state
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>KevTube</h1>
                {loading ? (
                    <p>Videos are loading...</p>
                ) : (
                    <div className="video-list">
                        {videos.length > 0 ? (
                            videos.map((video) => (
                                <div key={video._id} className="video-item">
                                    <h2 className="video-title">{video.title}</h2>
                                    <p className="video-transcript">{video.transcript}</p>
                                    <div className="video-info">
                                        <p>Likes: {video.likes}</p>
                                        <p>Uploaded: {new Date(video.uploadDate).toLocaleDateString()}</p>
                                    </div>

                                    <div className="video-player">
                                        <video controls width="100%">
                                            <source src={`http://localhost:8008/${video.filePath}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>

                                    <div className="comments-section">
                                        <h3>Comments:</h3>
                                        {video.comments.length > 0 ? (
                                            video.comments.map((comment) => (
                                                <div key={comment._id} className="comment-item">
                                                    <p><strong>{comment.name}</strong> ({comment.email})</p>
                                                    <p>{comment.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No comments yet.</p>
                                        )}
                                    </div>
                                </div>
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

export default App;
