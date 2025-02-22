import { CommentService } from '../services/comment.service.js';
import { Request, Response } from 'express';
import { CommentDto } from '../dto/CommentDto.js';

export class CommentController {
    static async addComment(req: Request, res: Response) {
        try {
            // ✅ Validate request body using DTO structure
            const { userId, content } = req.body;

            if (!userId || !content) {
                return res.status(400).json({ error: 'userId and content are required' });
            }

            const commentData = new CommentDto(userId, content);
            const newComment = await CommentService.addComment(Number(req.params.id), commentData);

            res.status(201).json(new CommentDto(newComment.userId, newComment.content));
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            res.status(500).send('❌ Fehler beim Hinzufügen des Kommentars.');
        }
    }

    static async getCommentsByVideo(req: Request, res: Response) {
        try {
            const comments = await CommentService.getCommentsByVideo(Number(req.params.id));
            const commentDtos = comments.map(comment => new CommentDto(comment.userId, comment.content));
            res.json(commentDtos);
        } catch (error) {
            console.error('❌ Fehler beim Abrufen der Kommentare:', error);
            res.status(500).send('❌ Fehler beim Abrufen der Kommentare.');
        }
    }
}
