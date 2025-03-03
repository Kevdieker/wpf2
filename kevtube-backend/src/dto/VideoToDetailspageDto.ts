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
    userHasLiked: boolean;
    description: string;
    transcript: string;

    constructor(
        id: number,
        title: string,
        videoUrl: string | null,
        views: number,
        uploadDate: Date,
        likes: number,
        uploaderUsername: string,
        comments: CommentDto[],
        userHasLiked: boolean,
        description: string,
        transcript: string
    ) {
        this.id = id;
        this.title = title;
        this.videoUrl = videoUrl && videoUrl.trim() !== "" ? videoUrl : "http://localhost:8088/resources/videos/input.mp4";
        this.views = views;
        this.uploadDate = uploadDate.toISOString();
        this.likes = likes;
        this.uploaderUsername = uploaderUsername;
        this.comments = comments;
        this.userHasLiked = userHasLiked;
        this.description = description;
        this.transcript = transcript;
    }
}
