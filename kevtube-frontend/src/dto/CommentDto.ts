export interface CommentDto {
    userId: number;
    username: string; // ✅ Added username for better frontend display
    content: string; // ✅ Match backend DTO field
}
