import { VideoService } from '../services/video.service';
import { Request, Response } from 'express';

export class VideoController {
    static async getAllVideos(req: Request, res: Response) {
        try {
            const videos = await VideoService.getAllVideos();
            res.json(videos);
        } catch (error) {
            console.error('❌ Error fetching videos:', error);
            res.status(500).send('❌ Fehler beim Abrufen der Videos.');
        }
    }

    static async getVideoById(req: Request, res: Response) {
        try {
            const video = await VideoService.getVideoById(Number(req.params.id));
            if (!video) return res.status(404).send('❌ Video nicht gefunden.');
            res.json(video);
        } catch (error) {
            console.error('❌ Error fetching video:', error);
            res.status(500).send('❌ Fehler beim Abrufen des Videos.');
        }
    }

    static async uploadVideo(req: Request, res: Response) {
        try {
            if (!req.file || !req.body.title || !req.body.userId) {
                return res.status(400).send('❌ Missing video file, title, or userId');
            }

            const video = await VideoService.uploadVideo(req.body.title, req.file, Number(req.body.userId));
            res.status(201).json(video);
        } catch (error) {
            console.error('❌ Error uploading video:', error);
            res.status(500).send('❌ Fehler beim Hochladen des Videos.');
        }
    }

    static async likeVideo(req: Request, res: Response) {
        try {
            const video = await VideoService.likeVideo(Number(req.params.id));
            res.status(200).json(video);
        } catch (error) {
            console.error('❌ Error liking video:', error);
            res.status(500).send('❌ Fehler beim Liken des Videos.');
        }
    }
}
