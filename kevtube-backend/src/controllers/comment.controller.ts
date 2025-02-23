import { CommentService } from '../services/comment.service';
import { Request, Response } from 'express';
import { CommentDto } from '../dto/CommentDto';

export class CommentController {
    static async addComment(req: Request, res: Response) {
        try {
            console.log("📥 Received Comment Data:", req.body); // ✅ Log incoming request

            // Validate request body
            const { userId, content } = req.body;

            if (!userId || !content) {
                console.log("❌ Missing required fields:", { userId, content });
                return res.status(400).json({ error: 'userId and content are required' });
            }

            // Convert userId to a number (if needed)
            const numericUserId = Number(userId);
            if (isNaN(numericUserId)) {
                console.log("❌ Invalid userId (must be an integer):", userId);
                return res.status(400).json({ error: 'Invalid userId format' });
            }

            const commentData = new CommentDto(numericUserId, content);
            console.log("📤 Sending to CommentService:", commentData);

            const newComment = await CommentService.addComment(Number(req.params.id), commentData);

            console.log("✅ Comment successfully created:", newComment);
            res.status(201).json(new CommentDto(newComment.userId, newComment.content));
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            res.status(500).send('❌ Fehler beim Hinzufügen des Kommentars.');
        }
    }

    static async getCommentsByVideo(req: Request, res: Response) {
        try {
            console.log("📥 Fetching comments for video ID:", req.params.id);
            const comments = await CommentService.getCommentsByVideo(Number(req.params.id));

            console.log("📤 Returning comments:", comments);
            const commentDtos = comments.map(comment => new CommentDto(comment.userId, comment.content));
            res.json(commentDtos);
        } catch (error) {
            console.error('❌ Fehler beim Abrufen der Kommentare:', error);
            res.status(500).send('❌ Fehler beim Abrufen der Kommentare.');
        }
    }
}

