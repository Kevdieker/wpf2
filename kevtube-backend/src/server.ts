import session from "express-session";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// ✅ Import controllers correctly
import authRoutes from "./controllers/auth.controller";
import videoRoutes from "./controllers/video.controller";
import commentRoutes from "./controllers/comment.controller";
import {seedDatabase} from "./seed";
import path from "node:path";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8888",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    credentials: true
}));

app.use(
    "/resources",
    express.static(path.join(__dirname, "..", "resources"))
);

// ✅ Body Parser Middleware
app.use(bodyParser.json());

// ✅ Express Session Middleware
app.use(session({
    secret: "kevtubewpf2",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

seedDatabase().then(() => {
    console.log("Database seeding complete. Starting server...");
})
// ✅ Use Controllers with Proper Imports
app.use("/auth", authRoutes);
app.use("/videos", videoRoutes);
app.use("/comments", commentRoutes);

app.listen(8088, () => console.log("🚀 Server running on port 8088"));
