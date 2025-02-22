import { CommentDto } from "./CommentDto.js";

export class VideoDto {
    id: number;
    title: string;
    transcript?: string;
    filePath: string;
    thumbnailUrl?: string;
    uploadDate: Date;
    likes: number;
    comments: CommentDto[];

    constructor(id: number, title: string, filePath: string, uploadDate: Date, likes: number, comments: CommentDto[], transcript?: string, thumbnailUrl?: string) {
        this.id = id;
        this.title = title;
        this.filePath = filePath;
        this.uploadDate = uploadDate;
        this.likes = likes;
        this.comments = comments;
        this.transcript = transcript;
        this.thumbnailUrl = thumbnailUrl;
    }
}
