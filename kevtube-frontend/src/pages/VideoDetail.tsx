import React from 'react'
import { useParams } from 'react-router-dom'

const VideoDetail: React.FC = () => {
    const { videoId } = useParams()

    // Here you'd fetch video details by `videoId`

    return (
        <div style={{ padding: '1rem' }}>
            <h2>VideoDetail - ID: {videoId}</h2>
            {/* Video player, comments, etc. */}
        </div>
    )
}

export default VideoDetail
