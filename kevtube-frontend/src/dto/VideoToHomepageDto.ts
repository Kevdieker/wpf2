export class VideoToHomepageDto {
    id: string;
    title: string;
    videoUrl?: string; // ✅ Optional (Some videos might not have a URL)
    thumbnailUrl?: string; // ✅ Optional (Some videos might not have a thumbnail)
    uploadDate: string;
    username: string;
    views: number;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.videoUrl = data.videoUrl?.trim() !== "" ? data.videoUrl : undefined; // ✅ Prevent empty string issues
        this.thumbnailUrl = data.thumbnailUrl?.trim() !== "" ? data.thumbnailUrl : undefined;
        this.uploadDate = new Date(data.uploadDate).toISOString(); // ✅ Ensure correct date format
        this.username = data.username;
        this.views = data.views;
    }
}
