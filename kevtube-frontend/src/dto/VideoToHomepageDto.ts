export class VideoToHomepageDto {
    id: string;
    title: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    uploadDate: string;
    username: string;
    views: number;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.videoUrl = data.videoUrl?.trim() !== "" ? data.videoUrl : undefined;
        this.thumbnailUrl = data.thumbnailUrl?.trim() !== "" ? data.thumbnailUrl : undefined;
        this.uploadDate = new Date(data.uploadDate).toISOString();
        this.username = data.username;
        this.views = data.views;
    }
}
