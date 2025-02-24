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

authRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Nutze dein RegisterDto hier
        // Prüfe, ob die E-Mail bereits existiert
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password,
            },
        });

        // Optional: Benutzer gleich einloggen (Session setzen)
        req.session.userId = newUser.id;

        return res.json({ message: "Registration successful", user: newUser });
    } catch (error: any) {
        console.error("[AUTH] Error registering user:", error);
        res.status(500).json({ error: "Error registering user" });
    }
});

export default authRouter;
