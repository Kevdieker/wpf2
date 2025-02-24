import {CommentDto} from "../dto/CommentDto";
import prisma from "../prisma/prismaClient";

export class CommentService {
    static async addComment(videoId: number, userId: number, content: string): Promise<CommentDto> {
        try {
            const comment = await prisma.comment.create({
                data: { videoId, userId, content },
                include: { user: true }
            });
            return new CommentDto(comment.userId, comment.user.username, comment.content);
        } catch (error: any) {
            console.error("[COMMENT SERVICE] Error creating comment:", error);
            throw error;
        }
    }
}
