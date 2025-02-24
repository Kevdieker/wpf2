import express from 'express';
import { VideoService } from '../services/video.service';

export const videoRouter = express.Router();

// ✅ Get all videos
videoRouter.get('/', async (req, res) => {
    console.log("[VIDEO CONTROLLER] GET /videos called");
    try {
        const videos = await VideoService.getAllVideos();
        console.log(`[VIDEO CONTROLLER] Returning ${videos.length} videos`);
        res.json(videos);
    } catch (error) {
        console.error("[VIDEO CONTROLLER] Error fetching videos:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get video by ID and increment views
videoRouter.get('/:id', async (req, res) => {

    try {
        const videoId = Number(req.params.id);
        const userId = req.session?.userId || null;

        if (isNaN(videoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }
        const video = await VideoService.getVideoById(videoId, userId);

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Like a video
videoRouter.post('/:id/like', async (req, res) => {
    console.log(`[VIDEO CONTROLLER] POST /videos/${req.params.id}/like called`);

    if (!req.session || !req.session.userId) {
        console.warn("[VIDEO CONTROLLER] Unauthorized like request");
        return res.status(401).json({ message: "You must be logged in to like a video" });
    }

    const videoId = Number(req.params.id);
    const userId = req.session.userId;

    try {
        const updatedVideo = await VideoService.likeVideo(videoId, userId);
        console.log(`[VIDEO CONTROLLER] Video ${videoId} liked by user ${userId}`);
        res.json(updatedVideo);
    } catch (error) {
        console.error(`[VIDEO CONTROLLER] Error liking video ID ${videoId}:`, error);
        res.status(400).json({ message: "Error liking video" });
    }
});

// ✅ Unlike a video
videoRouter.post('/:id/unlike', async (req, res) => {
    console.log(`[VIDEO CONTROLLER] POST /videos/${req.params.id}/unlike called`);

    if (!req.session || !req.session.userId) {
        console.warn("[VIDEO CONTROLLER] Unauthorized unlike request");
        return res.status(401).json({ message: "You must be logged in to unlike a video" });
    }

    const videoId = Number(req.params.id);
    const userId = req.session.userId;

    try {
        const updatedVideo = await VideoService.unlikeVideo(videoId, userId);
        console.log(`[VIDEO CONTROLLER] Video ${videoId} unliked by user ${userId}`);
        res.json(updatedVideo);
    } catch (error: any) {
        console.error(`[VIDEO CONTROLLER] Error unliking video ID ${videoId}:`, error);
        res.status(400).json({ message: "Error unliking video", error: error.message });
    }
});


// ✅ Correct export
export default videoRouter;
