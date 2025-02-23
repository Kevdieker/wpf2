import prisma from '../prisma/prismaClient';
import { VideoDto } from '../dto/VideoDto';
import { CommentDto } from '../dto/CommentDto';
import {VideoToHomepageDto} from "../dto/VideoToHomepageDto";

export class VideoService {
    static async getAllVideos(): Promise<VideoToHomepageDto[]> {
        const videos = await prisma.video.findMany();

        return videos.map(video => new VideoToHomepageDto(
            video.id,
            video.title,
            video.filePath,
           "video.thumbnailUrl",
            video.uploadDate,
            "username",
            111212
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
            video.comments.map(comment => new CommentDto(comment.userId, comment.content))
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
            video.comments.map(comment => new CommentDto(comment.userId, comment.content))
        );
    }
}