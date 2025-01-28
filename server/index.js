import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();
dotenv.config();

const url2 = 'mongodb+srv://kevinkerblkk:test@cluster0.olhej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

console.log("hi2");
const connect = () => {
    mongoose.connect(url2)
        .then(() => console.log('Connected to DB'))
        .catch((err) => console.log(err));
};
app.listen(8080, () => {
    connect();
    console.log("Server started on port 8080");
});
