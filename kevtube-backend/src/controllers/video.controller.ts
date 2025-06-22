import express from 'express';
import { VideoService } from '../services/video.service';

export const videoRouter = express.Router();


videoRouter.get('/', async (req, res) => {
    try {
        const videos = await VideoService.getAllVideos();
        res.json(videos);
    } catch (error) {
        console.error("[VIDEO CONTROLLER] Error fetching videos:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

videoRouter.get('/:id', async (req, res) => {

    try {
        const videoId = Number(req.params.id);
        const userId = req.session?.userId || null;

        if (isNaN(videoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }
        let incrementView = true;
        if (req.session) {
            if (!req.session.viewedVideos) {
                req.session.viewedVideos = [];
            } else if (req.session.viewedVideos.includes(videoId)) {
                incrementView = false;
            } else {
                req.session.viewedVideos.push(videoId);
            }
        }

        const video = await VideoService.getVideoById(videoId, userId, incrementView);

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

videoRouter.post('/:id/like', async (req, res) => {
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

videoRouter.post('/:id/unlike', async (req, res) => {
    if (!req.session || !req.session.userId) {
        console.warn("[VIDEO CONTROLLER] Unauthorized unlike request");
        return res.status(401).json({ message: "You must be logged in to unlike a video" });
    }

    const videoId = Number(req.params.id);
    const userId = req.session.userId;

    try {
        const updatedVideo = await VideoService.unlikeVideo(videoId, userId);
        res.json(updatedVideo);
    } catch (error: any) {
        console.error(`[VIDEO CONTROLLER] Error unliking video ID ${videoId}:`, error);
        res.status(400).json({ message: "Error unliking video", error: error.message });
    }
});

export default videoRouter;
