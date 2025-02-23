import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Hls from 'hls.js'; // ✅ Import HLS.js
import '../styles/App.css';
import { VideoDto } from "../dto/VideoDTO.ts";
import { CommentDto } from "../dto/CommentDto.ts";

const VideoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<VideoDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement | null>(null); // ✅ Ref for video player

    // ✅ Always set userId to 6
    useEffect(() => {
        localStorage.setItem('userId', String(6));
    }, []);

    const userId = Number(localStorage.getItem('userId'));
    const userName = localStorage.getItem('userName') || 'Guest User';

    const API_URL = `http://localhost:8008/video/${id}`;

    // ✅ Fetch Video Details on Mount
    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await axios.get<VideoDto>(API_URL);
                console.log('✅ API Loaded Video:', response.data);
                setVideo(response.data);
            } catch (error) {
                console.error('❌ Error fetching video details:', error);
                setError('Failed to load video details.');
            } finally {
                setLoading(false);
            }
        };
        fetchVideoDetails();
    }, [id]);

    // ✅ Handle `.m3u8` Streaming with HLS.js
    useEffect(() => {
        if (video && video.filePath.endsWith('.m3u8')) {
            if (Hls.isSupported() && videoRef.current) {
                const hls = new Hls();
                hls.loadSource(`http://localhost:8008/${video.filePath}`);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current?.play();
                });
            } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
                // ✅ Safari native support for HLS
                videoRef.current.src = `http://localhost:8008/${video.filePath}`;
                videoRef.current.addEventListener('loadedmetadata', () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [video]);

    // ✅ Like Video
    const likeVideo = async () => {
        if (!video) return;
        try {
            const response = await axios.put(`${API_URL}/like`);
            if (response.data && typeof response.data.likes === 'number') {
                setVideo((prevVideo) =>
                    prevVideo ? { ...prevVideo, likes: response.data.likes } : prevVideo
                );
            } else {
                console.error('❌ Unexpected response for like:', response.data);
            }
        } catch (error) {
            console.error('❌ Error liking video:', error);
            setError('Failed to like the video.');
        }
    };

    // ✅ Submit Comment Using DTO
    const submitComment = async () => {
        if (!newComment.trim() || !video) return;
        if (!userId) {
            console.error('❌ User not logged in – cannot submit comment.');
            setError('You must be logged in to comment.');
            return;
        }

        const commentDto: CommentDto = {
            userId,
            content: newComment,
        };

        try {
            const response = await axios.post(`${API_URL}/comment`, commentDto);

            console.log('🟢 Server Response:', response.data);

            const createdComment: CommentDto = {
                userId,
                content: newComment,
            };

            setVideo((prevVideo) => {
                if (!prevVideo) return prevVideo;
                return { ...prevVideo, comments: [...prevVideo.comments, createdComment] };
            });

            setNewComment('');
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            setError('Failed to add comment.');
        }
    };

    if (loading) return <p className="loading-text">Loading video details...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!video) return <p className="error-text">Video not found.</p>;

    return (
        <div className="video-detail-container">
            <h1 className="video-title">{video.title}</h1>
            <div className="video-player">
                <video
                    ref={videoRef}
                    id="video-player"
                    controls
                    width="100%"
                    height="auto"
                >
                    {video.filePath.endsWith('.m3u8') ? null : (
                        <source src={`http://localhost:8008/${video.filePath}`} type="video/mp4" />
                    )}
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
            {video.comments.length > 0 ? (
                <ul className="comment-list">
                    {video.comments.map((comment, index) => (
                        <li key={index} className="comment-item">
                            <p>
                                <strong>{userName || 'Anonymous'}:</strong> {comment.content}
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
