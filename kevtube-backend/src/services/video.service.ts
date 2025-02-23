import prisma from '../prisma/prismaClient';
import { VideoDto } from '../dto/VideoDto';
import { CommentDto } from '../dto/CommentDto';
import { exec } from "node:child_process";
import path from "node:path";

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
            video.comments.map(comment => new CommentDto(comment.userId, comment.content))
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

    static async uploadVideo(title: string, file: Express.Multer.File, userId: number): Promise<VideoDto> {
        if (!userId) throw new Error("❌ User ID is required to upload a video.");

        const videoId = Math.floor(Math.random() * 10000);
        const videoFolder = `resources/videos/${videoId}`;
        const videoPath = path.join(videoFolder, 'input.mp4');
        const hlsPath = path.join(videoFolder, 'stream.m3u8');
        const thumbnailPath = path.join(videoFolder, 'thumbnail.jpg');

        exec(`mkdir -p ${videoFolder} && mv ${file.path} ${videoPath}`, (err) => {
            if (err) console.error('❌ Error moving video file:', err);
        });

        exec(`ffmpeg -i ${videoPath} -preset fast -g 48 -sc_threshold 0 -hls_time 4 -hls_playlist_type vod -b:v 2500k -maxrate 2675k -bufsize 3750k -b:a 128k -hls_segment_filename "${videoFolder}/segment_%03d.ts" ${hlsPath}`, (err) => {
            if (err) console.error('❌ Error converting video to HLS:', err);
            else console.log('✅ Video converted to HLS successfully!');
        });

        exec(`ffmpeg -i ${videoPath} -ss 00:00:05 -vframes 1 ${thumbnailPath}`, (err) => {
            if (err) console.error('❌ Error generating thumbnail:', err);
            else console.log('✅ Thumbnail generated successfully!');
        });

        const newVideo = await prisma.video.create({
            data: {
                title: title,
                filePath: `videos/${videoId}/stream.m3u8`,
                uploadDate: new Date(),
                likes: 0,
                userId: userId
            }
        });

        return new VideoDto(
            newVideo.id,
            newVideo.title,
            `http://localhost:8008/videos/${videoId}/stream.m3u8`,
            newVideo.uploadDate,
            newVideo.likes,
            []
        );
    }
}
