import express from 'express';
import prisma from '../prisma/prismaClient';

const authRouter = express.Router();

// ✅ LOGIN - Store user in session
authRouter.post('/login', async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id; // ✅ Store userId in session

    res.json({ message: "Logged in", userId: user.id });
});

// ✅ LOGOUT - Destroy session
authRouter.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

// ✅ CHECK LOGIN STATUS
authRouter.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: { id: true, username: true }
    });

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    res.json(user); // ✅ Send user info
});

export default authRouter;
