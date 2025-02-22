import { CommentDto } from "./CommentDto";

export interface VideoDto {
    id: string;
    title: string;
    transcript?: string;
    filePath: string;
    uploadDate: string;
    likes: number;
    comments: CommentDto[];
}
