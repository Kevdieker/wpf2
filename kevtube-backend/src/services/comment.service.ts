import prisma from '../prisma/prismaClient'
import { CommentDto } from '../dto/CommentDto';

export class CommentService {
    static async addComment(videoId: number, commentData: CommentDto): Promise<CommentDto> {
        const newComment = await prisma.comment.create({
            data: {
                videoId: videoId,
                userId: commentData.userId,
                content: commentData.content
            }
        });
        return new CommentDto(newComment.userId, newComment.content);
    }

    static async getCommentsByVideo(videoId: number): Promise<CommentDto[]> {
        const comments = await prisma.comment.findMany({
            where: { videoId: videoId }
        });
        return comments.map(comment => new CommentDto(comment.userId, comment.content));
    }
}
