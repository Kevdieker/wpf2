import { CommentDto } from "./CommentDto";

export class VideoToDetailspageDto {
    id: number;
    title: string;
    videoUrl?: string;
    views: number;
    likes: number;
    uploadDate: string;
    uploaderUsername: string;
    comments: CommentDto[];
    userHasLiked: boolean; // ✅ Keep this property

    constructor(
        id: number,
        title: string,
        videoUrl: string | null,
        views: number,
        uploadDate: Date,
        likes: number,
        uploaderUsername: string,
        comments: CommentDto[],
        userHasLiked: boolean // ✅ Keep this
    ) {
        this.id = id;
        this.title = title;
        this.videoUrl = videoUrl && videoUrl.trim() !== ""
            ? videoUrl
            : `http://localhost:8008/videos/${id}/stream.m3u8`;
        this.views = views;
        this.uploadDate = uploadDate.toISOString();
        this.likes = likes;
        this.uploaderUsername = uploaderUsername;
        this.comments = comments;
        this.userHasLiked = userHasLiked; // ✅ Store if user liked the video
    }
}
