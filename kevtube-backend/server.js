import dotenv from 'dotenv';
import express from 'express'; // ES-Module Syntax
import multer from 'multer';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import Video from './models/Video.js'; // Importiere das Schema mit ES-Modules


const app = express();
dotenv.config();

const url2 = 'mongodb+srv://kevinkerblkk:test@cluster0.olhej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

console.log("hi2");
const connect = () => {
    mongoose.connect(url2, {useNewUrlParser: true,
        useUnifiedTopology: true,})
        .then(() => console.log('Connected to DB'))
        .catch((err) => console.log(err));
};


// Multer für Dateiuploads
const upload = multer({ dest: 'videos/' });

// Video hochladen
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const newVideo = new Video({
            title: req.body.title,
            transcript: req.body.transcript,
            filePath: req.file.path,
        });
        await newVideo.save();
        res.status(201).send('Video erfolgreich hochgeladen!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Hochladen des Videos.');
    }
});

// Kommentar hinzufügen
app.post('/video/:id/comment', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).send('Video nicht gefunden.');
        }

        const newComment = {
            userId: req.body.userId,
            name: req.body.name,
            email: req.body.email,
            comment: req.body.comment,
        };

        video.comments.push(newComment);
        await video.save();

        res.status(201).send('Kommentar erfolgreich hinzugefügt!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Hinzufügen des Kommentars.');
    }
});

// Alle Videos anzeigen
app.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Abrufen der Videos.');
    }
});

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});


app.use(bodyParser.json());


