import prisma from '../prisma/prismaClient.js';
import { VideoDto } from '../dto/VideoDto.js';
import { CommentDto } from '../dto/CommentDto.js';

export class VideoService {
    static async getAllVideos(): Promise<VideoDto[]> {
        const videos = await prisma.video.findMany({
            include: { comments: true }
        });

        return videos.map(video => new VideoDto(
            video.id,
            video.title,
            video.filePath,
            video.uploadDate,
            video.likes,
            video.comments.map(comment => new CommentDto(comment.userId, comment.content)),
            undefined,
            undefined
        ));
    }

    static async getVideoById(videoId: number): Promise<VideoDto | null> {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: { comments: true }
        });

        return video ? new VideoDto(
            video.id,
            video.title,
            video.filePath,
            video.uploadDate,
            video.likes,
            video.comments.map(comment => new CommentDto(comment.userId, comment.content)),
            undefined,
            undefined
        ) : null;
    }

    static async likeVideo(videoId: number): Promise<VideoDto> {
        const video = await prisma.video.update({
            where: { id: videoId },
            data: { likes: { increment: 1 } },
            include: { comments: true }
        });

        return new VideoDto(
            video.id,
            video.title,
            video.filePath,
            video.uploadDate,
            video.likes,
            video.comments.map(comment => new CommentDto(comment.userId, comment.content)),
            undefined,
            undefined
        );
    }
}
