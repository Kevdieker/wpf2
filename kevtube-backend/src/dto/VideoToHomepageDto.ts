export class VideoToHomepageDto {
    id: number;
    title: string;
    thumbnailUrl: string;
    uploadDate: string;
    username: string;
    views: number;

    constructor(
        id: number,
        title: string,
        thumbnailUrl: string,
        uploadDate: Date,
        username: string,
        views: number
    ) {
        this.id = id;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl && thumbnailUrl.trim() !== ""
            ? thumbnailUrl
            : "http://localhost:8088/resources/sample.jpg";
        this.uploadDate = uploadDate.toISOString();
        this.username = username;
        this.views = views;
    }
}
