// src/utils/fetchVideos.ts
export interface VideoComment {
    userId: string
    name: string
    email: string
    comment: string
    _id: string
    date: string
}

export interface VideoItem {
    _id: string
    title: string
    transcript: string
    filePath: string
    likes: number
    comments: VideoComment[]
    uploadDate: string
    __v: number
}

export async function fetchVideos(): Promise<VideoItem[]> {
    const response = await fetch('http://localhost:8008/videos')
    if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.statusText}`)
    }

    const data = await response.json()
    return data as VideoItem[]
}
