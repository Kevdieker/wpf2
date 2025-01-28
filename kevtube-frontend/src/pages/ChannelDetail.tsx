import React from 'react'
import { useParams } from 'react-router-dom'

const ChannelDetail: React.FC = () => {
    const { channelId } = useParams()

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Channel Detail - ID: {channelId}</h2>
            {/* Channel banner, channel videos, etc. */}
        </div>
    )
}

export default ChannelDetail
