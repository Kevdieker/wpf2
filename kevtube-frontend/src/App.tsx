// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VideoDetail from "./pages/VideoDetail.tsx";

function App() {
    return (
        <Router>
            {/* If you have a Navbar, you can place it here */}
            <Routes>
                {/* The Home page displays all videos */}
                <Route path="/" element={<Home />} />
                <Route path="/videos/:id" element={<VideoDetail />} />
                {/*
          Example additional routes:

          <Route path="/about" element={<About />} />
        */}
            </Routes>
        </Router>
    )
}

export default App
