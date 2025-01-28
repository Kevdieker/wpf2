import dotenv from 'dotenv';
import express from 'express'; // ES-Module Syntax
import multer from 'multer';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import Video from './models/Video.js'; // Importiere das Schema mit ES-Modules
import cors from 'cors';

const app = express();
app.use(cors())
dotenv.config();

const url2 = 'mongodb+srv://kevinkerblkk:test@cluster0.olhej.mongodb.net/?retryWrites=true&w=majority&appName=kevtube'

console.log("hi2");

await mongoose.connect(url2, {useNewUrlParser: true,
        useUnifiedTopology: true,   bufferCommands: false })
        .then(() => console.log('Connected to DB'))
        .catch((err) => console.log(err));


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

const addVideoWithComments = async () => {
    try {
        const newVideo = new Video({
            title: 'Mein cooles Video',
            transcript: 'Dies ist das Transkript des Videos.',
            filePath: 'uploads/videos/video123.mp4',
            likes: 10,
            comments: [
                {
                    userId: 'user123',
                    name: 'Max Mustermann',
                    email: 'max@example.com',
                    comment: 'Toller Inhalt, sehr informativ!',
                },
                {
                    userId: 'user456',
                    name: 'Maria Musterfrau',
                    email: 'maria@example.com',
                    comment: 'Fand das Video sehr hilfreich, danke!',
                },
            ],
        });

        // Speichere das Video mit den Kommentaren in der Datenbank
        await newVideo.save();
        console.log('Video erfolgreich gespeichert!');
    } catch (error) {
        console.error('Fehler beim Speichern des Videos:', error);
    }
};

// Funktion ausführen, um das Video hinzuzufügen
addVideoWithComments();

// Server starten
app.listen(8008, () => {
    console.log('Server läuft auf Port 3000');
});


app.use(bodyParser.json());


