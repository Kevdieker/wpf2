import React from 'react'

const Sidebar: React.FC = () => {
    const categories = ['Home', 'Trending', 'Music', 'Sports', 'News']

    return (
        <div style={styles.sidebar}>
            {categories.map((category) => (
                <div key={category} style={styles.item}>
                    {category}
                </div>
            ))}
        </div>
    )
}

const styles = {
    sidebar: {
        width: '200px',
        background: '#fefefe',
        borderRight: '1px solid #ccc',
        padding: '1rem'
    },
    item: {
        marginBottom: '1rem',
        cursor: 'pointer'
    }
} as const

export default Sidebar
