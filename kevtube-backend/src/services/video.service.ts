import prisma from '../prisma/prismaClient';
import { VideoToHomepageDto } from '../dto/VideoToHomepageDto';
import { VideoToDetailspageDto } from '../dto/VideoToDetailspageDto';
import { CommentDto } from '../dto/CommentDto';

export class VideoService {
    // ✅ Get All Videos for Homepage
    static async getAllVideos(): Promise<VideoToHomepageDto[]> {
        const videos = await prisma.video.findMany({
            include: { user: true }
        });

        return videos.map(video => new VideoToHomepageDto(
            video.id,
            video.title,
            video.thumbnailUrl ?? '',
            video.uploadDate,
            video.user.username,
            video.views
        ));
    }

    // ✅ Get Video by ID and Increment Views
    static async getVideoById(videoId: number, userId: number | null): Promise<VideoToDetailspageDto | null> {
        const video = await prisma.video.update({
            where: { id: videoId },
            data: { views: { increment: 1 } }, // ✅ Increase views
            include: {
                user: true,
                comments: { include: { user: true } },
                likedBy: true // ✅ Check likes
            }
        });

        if (!video) return null;

        // ✅ Check if the user has already liked this video
        const userHasLiked = userId ? video.likedBy.some(like => like.userId === userId) : false;

        return new VideoToDetailspageDto(
            video.id,
            video.title,
            video.videoUrl ?? null,
            video.views,
            video.uploadDate,
            video.likes,
            video.user.username,
            video.comments.map(comment =>
                new CommentDto(comment.userId, comment.user.username, comment.content)
            ),
            userHasLiked // ✅ Return whether the user liked the video
        );
    }

    // ✅ Like a Video (Only Once Per User)
    static async likeVideo(videoId: number, userId: number): Promise<VideoToDetailspageDto> {
        // Check if user has already liked the video
        const existingLike = await prisma.like.findFirst({
            where: { videoId, userId }
        });

        if (existingLike) {
            throw new Error('You have already liked this video');
        }

        // Add Like
        await prisma.like.create({ data: { videoId, userId } });

        // Increment like count
        const video = await prisma.video.update({
            where: { id: videoId },
            data: { likes: { increment: 1 } },
            include: { user: true, comments: { include: { user: true } }, likedBy: true }
        });

        return new VideoToDetailspageDto(
            video.id,
            video.title,
            video.videoUrl ?? null,
            video.views,
            video.uploadDate,
            video.likes,
            video.user.username,
            video.comments.map(comment =>
                new CommentDto(comment.userId, comment.user.username, comment.content)
            ),
            true // ✅ Mark the user as having liked the video
        );
    }

    // ✅ Unlike a Video
    static async unlikeVideo(videoId: number, userId: number): Promise<VideoToDetailspageDto> {
        // Prüfe, ob der Benutzer den Like bereits gesetzt hat
        const existingLike = await prisma.like.findFirst({
            where: { videoId, userId }
        });

        if (!existingLike) {
            throw new Error("You haven't liked this video yet");
        }

        // Entferne den Like-Eintrag
        await prisma.like.deleteMany({
            where: { videoId, userId }
        });

        // Dekrementiere den Like-Zähler im Video
        const video = await prisma.video.update({
            where: { id: videoId },
            data: { likes: { decrement: 1 } },
            include: { user: true, comments: { include: { user: true } }, likedBy: true }
        });

        // Erstelle das DTO und setze userHasLiked auf false
        return new VideoToDetailspageDto(
            video.id,
            video.title,
            video.videoUrl ?? null,
            video.views,
            video.uploadDate,
            video.likes,
            video.user.username,
            video.comments.map(comment =>
                new CommentDto(comment.userId, comment.user.username, comment.content)
            ),
            false // Der Benutzer hat das Video nicht mehr geliked
        );
    }

}
