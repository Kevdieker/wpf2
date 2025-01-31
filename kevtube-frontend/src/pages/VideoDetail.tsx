import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

/**
 * The server has:
 * 1) GET  /video/:id         -> Returns entire video (including comments)
 * 2) POST /video/:id/comment -> Adds a new comment
 *
 * There's NO endpoint GET /video/:id/comments (currently 404).
 * We'll remove the second fetch to /video/:id/comments and rely on the main GET /video/:id.
 *
 * The server might return { message: 'Kommentar erfolgreich hinzugefügt!' }
 * but not an actual comment object — we can generate one on the client side.
 */

interface Comment {
    _id?: string;
    userId: string;
    name?: string;
    email: string;
    comment?: string;
    date?: string;
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
    const [newComment, setNewComment] = useState<string>('');
    const [userInfo] = useState<{ name: string; email: string }>({
        name: 'User',
        email: 'user@example.com',
    });

    const API_URL = `http://localhost:8008/video/${id}`;

    // 1) FETCH VIDEO (with comments) on mount
    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await axios.get<Video>(API_URL);
                console.log('API Loaded Video:', response.data);
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

    // 2) LIKE VIDEO
    const likeVideo = async () => {
        if (!video) return;
        try {
            const response = await axios.put(`${API_URL}/like`);
            // The server presumably returns something like { likes: number }
            if (response.data && typeof response.data.likes === 'number') {
                setVideo((prevVideo) =>
                    prevVideo ? { ...prevVideo, likes: response.data.likes } : prevVideo
                );
            } else {
                console.error('Unexpected response for like:', response.data);
            }
        } catch (error) {
            console.error('Error liking video:', error);
            setError('Failed to like the video.');
        }
    };

    // 3) SUBMIT COMMENT
    const submitComment = async () => {
        console.log('🔵 submitComment() wurde aufgerufen');
        if (!newComment.trim() || !video) return;

        try {
            console.log('🟠 Sende API-Anfrage an:', `${API_URL}/comment`);
            const response = await axios.post(`${API_URL}/comment`, {
                userId: 'user123',
                name: userInfo.name,
                email: userInfo.email,
                comment: newComment,
            });
            console.log('🟢 Server-Antwort erhalten:', response.data);

            // The server returns something like:
            // { message: 'Kommentar erfolgreich hinzugefügt!' }
            // so we'll create the new comment ourselves:
            const createdComment: Comment = {
                _id: Math.random().toString(36).substring(2, 10),
                userId: 'user123',
                name: userInfo.name,
                email: userInfo.email,
                comment: newComment,
                date: new Date().toISOString(),
            };

            // Add the newly created comment into our state
            setVideo((prevVideo) => {
                if (!prevVideo) return prevVideo;
                return { ...prevVideo, comments: [...prevVideo.comments, createdComment] };
            });

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Failed to add comment.');
        }
    };

    if (loading) return <p className="loading-text">Loading video details...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!video) return <p className="error-text">Video not found.</p>;

    // Safely render comments array
    const safeComments = (video.comments || []).filter((c) => c && c.comment);

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
                <p>
                    <strong>📅 Uploaded:</strong> {new Date(video.uploadDate).toLocaleDateString()}
                </p>
                <p>
                    <strong>👍 Likes:</strong> {video.likes}
                </p>
            </div>
            <button className="command-btn like-btn" onClick={likeVideo}>
                ❤️ Like ({video.likes})
            </button>

            <h2 className="comments-heading" id="comment-section">
                💬 Comments
            </h2>
            {safeComments.length > 0 ? (
                <ul className="comment-list">
                    {safeComments.map((comment, index) => (
                        <li key={comment._id || index} className="comment-item">
                            <p>
                                <strong>{comment.name || 'Anonymous'}:</strong> {comment.comment}
                            </p>
                            <p className="comment-date">
                                {comment.date ? new Date(comment.date).toLocaleString() : 'Unknown date'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-comments">No comments yet. Be the first to share your thoughts! 💭</p>
            )}

            <div className="add-comment-section">
        <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
            rows={3}
        />
                <button className="add-comment-btn" onClick={submitComment} disabled={!newComment.trim()}>
                    Post Comment
                </button>
            </div>
        </div>
    );
};

export default VideoDetail;
