export class VideoToHomepageDto {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    uploadDate: string;
    username: string;
    views: number;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.videoUrl = data.videoUrl;
        this.thumbnailUrl = data.thumbnailUrl;
        this.uploadDate = data.uploadDate;
        this.username = data.username;
        this.views = data.views;
    }
}
