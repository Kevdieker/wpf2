import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import swagger from './swagger/swagger.js';
import { VideoController } from './controllers/video.controller.js';
import { CommentController } from './controllers/comment.controller.js';
import { seedDatabase } from './seed.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'resources/videos/' });

// 📌 VIDEO ROUTES
app.get('/videos', VideoController.getAllVideos);
app.get('/video/:id', VideoController.getVideoById);
//app.post('/videos/upload', upload.single('video'), VideoController.uploadVideo);
app.put('/video/:id/like', VideoController.likeVideo);

// 📌 COMMENT ROUTES
app.post('/video/:id/comment', CommentController.addComment);
app.get('/video/:id/comments', CommentController.getCommentsByVideo);

// 📌 Swagger API Docs
swagger(app);

// 📌 Start Server
const PORT = process.env.PORT ? Number(process.env.PORT) : 8008;
app.listen(PORT, async () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);

    // 📌 Seed Database (if needed)
    await seedDatabase();
});
