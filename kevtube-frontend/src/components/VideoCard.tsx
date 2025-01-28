import React from 'react'

interface VideoCardProps {
    title: string
    thumbnailUrl: string
    channel: string
}

const VideoCard: React.FC<VideoCardProps> = ({ title, thumbnailUrl, channel }) => {
    return (
        <div style={styles.card}>
            <img src={thumbnailUrl} alt={title} style={styles.thumbnail} />
            <div style={styles.info}>
                <h4>{title}</h4>
                <p>{channel}</p>
            </div>
        </div>
    )
}

const styles = {
    card: {
        width: '300px',
        margin: '0.5rem'
    },
    thumbnail: {
        width: '100%',
        height: 'auto',
        display: 'block'
    },
    info: {
        padding: '0.5rem'
    }
} as const

export default VideoCard
