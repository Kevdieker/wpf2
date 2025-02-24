import { CommentDto } from "./CommentDto";

export interface VideoToDetailspageDto {
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
}
