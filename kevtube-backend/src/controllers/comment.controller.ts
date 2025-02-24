import express from 'express';
import { CommentService } from '../services/comment.service';

export const commentRouter = express.Router();

commentRouter.post('/', async (req, res) => {
    if (!req.session || !req.session.userId) {
        console.error("[COMMENT CONTROLLER] Unauthorized comment request");
        return res.status(401).json({ message: "You must be logged in to comment" });
    }

    const { videoId, content } = req.body;
    const userId = req.session.userId;

    if (!videoId || !content) {
        console.error("[COMMENT CONTROLLER] Missing videoId or content in request body");
        return res.status(400).json({ message: "Missing videoId or content" });
    }

    try {
        const commentDto = await CommentService.addComment(Number(videoId), userId, content);
        res.json(commentDto);
    } catch (error: any) {
        console.error("[COMMENT CONTROLLER] Error adding comment:", error);
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
});

export default commentRouter;
