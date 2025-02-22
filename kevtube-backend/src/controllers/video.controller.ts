import { VideoService } from '../services/video.service.js';
import { Request, Response } from 'express';
import { VideoDto } from '../dto/VideoDto.js';

export class VideoController {
    static async getAllVideos(req: Request, res: Response) {
        try {
            const videos = await VideoService.getAllVideos();
            res.json(videos.map(video => new VideoDto(
                video.id,
                video.title,
                video.filePath,
                video.uploadDate,
                video.likes,
                video.comments,
                video.transcript,
                video.thumbnailUrl
            )));
        } catch (error) {
            console.error('❌ Error fetching videos:', error);
            res.status(500).send('❌ Fehler beim Abrufen der Videos.');
        }
    }

    static async getVideoById(req: Request, res: Response) {
        try {
            const video = await VideoService.getVideoById(Number(req.params.id));
            if (!video) return res.status(404).send('❌ Video nicht gefunden.');

            res.json(new VideoDto(
                video.id,
                video.title,
                video.filePath,
                video.uploadDate,
                video.likes,
                video.comments,
                video.transcript,
                video.thumbnailUrl
            ));
        } catch (error) {
            console.error('❌ Error fetching video:', error);
            res.status(500).send('❌ Fehler beim Abrufen des Videos.');
        }
    }

    static async likeVideo(req: Request, res: Response) {
        try {
            const video = await VideoService.likeVideo(Number(req.params.id));
            res.status(200).json(new VideoDto(
                video.id,
                video.title,
                video.filePath,
                video.uploadDate,
                video.likes,
                video.comments,
                video.transcript,
                video.thumbnailUrl
            ));
        } catch (error) {
            console.error('❌ Error liking video:', error);
            res.status(500).send('❌ Fehler beim Liken des Videos.');
        }
    }
}
