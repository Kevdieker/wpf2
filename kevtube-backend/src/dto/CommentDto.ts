export class CommentDto {
    userId: number;
    content: string;

    constructor(userId: number, content: string) {
        this.userId = userId;
        this.content = content;
    }
}
