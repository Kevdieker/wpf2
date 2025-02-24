// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VideoDetail from "./pages/VideoDetail.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/videos/:id" element={<VideoDetail />} />
            </Routes>
        </Router>
    )
}

export default App
