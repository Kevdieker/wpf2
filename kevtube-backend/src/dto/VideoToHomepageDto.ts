export class VideoToHomepageDto {
    id: number;
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    uploadDate: string;
    username: string;
    views: number;

    constructor(
        id: number,
        title: string,
        videoUrl: string,
        thumbnailUrl: string,
        uploadDate: Date,
        username: string,
        views: number
    ) {
        this.id = id;
        this.title = title;
        this.videoUrl = videoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.uploadDate = uploadDate.toISOString();
        this.username = username;
        this.views = views;
    }
}
