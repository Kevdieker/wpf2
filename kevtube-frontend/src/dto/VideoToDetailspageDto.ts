import { CommentDto } from "./CommentDto";

export interface VideoToDetailspageDto {
    id: string;
    title: string;
    transcript?: string;
    videoUrl?: string; // ✅ Optional: Some videos might not have a file path
    uploadDate: string;
    likes: number;
    views: number;
    uploaderUsername: string; // ✅ Added uploader's name
    userHasLiked: boolean; // ✅ Indicates if the logged-in user liked the video
    comments: CommentDto[]; // ✅ Always return an array, even if empty
}
