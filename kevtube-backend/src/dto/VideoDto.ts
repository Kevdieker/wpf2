import { CommentDto } from "./CommentDto";

export class VideoDto {
    id: number;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    uploadDate: Date;
    likes: number;
    comments: CommentDto[];

    constructor(
        id: number,
        title: string,
        filePath: string,
        uploadDate: Date,
        likes: number,
        comments: CommentDto[]
    ) {
        this.id = id;
        this.title = title;

        // ✅ Ensure HLS streaming URL is correct
        this.videoUrl = `http://localhost:8008/videos/${id}/stream.m3u8`;

        // ✅ Generate thumbnail URL
        this.thumbnailUrl = `http://localhost:8008/thumbnails/${id}.jpg`;

        this.uploadDate = uploadDate;
        this.likes = likes;
        this.comments = comments;
    }
}
