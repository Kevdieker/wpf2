export class CommentDto {
    userId: number;
    username: string;
    content: string;

    constructor(userId: number, username: string, content: string) {
        this.userId = userId;
        this.username = username;
        this.content = content;
    }
}
