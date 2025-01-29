import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // Make sure this file has the updated styles

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

const VideoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = `http://localhost:8008/video/${id}`;

    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await axios.get<Video>(API_URL);
                setVideo(response.data);
            } catch (error) {
                console.error('Error fetching video details:', error);
                setError('Failed to load video details.');
            } finally {
                setLoading(false);
            }
        };

        fetchVideoDetails();
    }, [id]);

    if (loading) return <p className="loading-text">Loading video details...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!video) return <p className="error-text">Video not found.</p>;

    return (
        <div className="video-detail-container">
            <h1 className="video-title">{video.title}</h1>

            <div className="video-player">
                <video controls>
                    <source src={`http://localhost:8008/${video.filePath}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="video-info">
                <p><span className="highlight">📅 Uploaded:</span> {new Date(video.uploadDate).toLocaleDateString()}</p>
                <p><span className="highlight">👍 Likes:</span> {video.likes}</p>
            </div>

            <div className="commands-section">
                <h2>⚡ Quick Actions</h2>
                <div className="commands-buttons">
                    <button className="command-btn like-btn">❤️ Like</button>
                    <button className="command-btn comment-btn">💬 Comment</button>
                    <button className="command-btn share-btn">🔗 Share</button>
                    <button className="command-btn save-btn">📌 Save</button>
                </div>
            </div>

            <h2 className="comments-heading">💬 Comments</h2>
            {video.comments.length > 0 ? (
                <ul className="comment-list">
                    {video.comments.map((comment) => (
                        <li key={comment._id} className="comment-item">
                            <p><strong>{comment.name}:</strong> {comment.comment}</p>
                            <p className="comment-date">{new Date(comment.date).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-comments">No comments yet. Be the first to share your thoughts! 💭</p>
            )}
        </div>
    );
};

export default VideoDetail;
