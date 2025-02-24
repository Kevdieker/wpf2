import {CommentDto} from "../dto/CommentDto";
import prisma from "../prisma/prismaClient";

export class CommentService {
    static async addComment(videoId: number, userId: number, content: string): Promise<CommentDto> {
        console.log(`[COMMENT SERVICE] Adding comment for video ${videoId} by user ${userId} with content: "${content}"`);
        try {
            const comment = await prisma.comment.create({
                data: { videoId, userId, content },
                include: { user: true }
            });
            console.log("[COMMENT SERVICE] Comment created successfully in DB:", comment);
            return new CommentDto(comment.userId, comment.user.username, comment.content);
        } catch (error: any) {
            console.error("[COMMENT SERVICE] Error creating comment:", error);
            throw error;
        }
    }
}
