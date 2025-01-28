import React from 'react'

const Navbar: React.FC = () => {
    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>MyTube</div>
            {/* In a real app, you'd use a dedicated SearchBar component */}
            <input style={styles.search} type="text" placeholder="Search..." />
            <div style={styles.icons}>[User Icon]</div>
        </nav>
    )
}

const styles = {
    navbar: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ccc'
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginRight: '2rem'
    },
    search: {
        flex: 1,
        marginRight: '2rem',
        padding: '0.3rem 0.6rem'
    },
    icons: {}
} as const

export default Navbar
