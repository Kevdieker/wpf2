import express from 'express';
import { AuthService } from '../services/auth.service';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await AuthService.register(username, email, password);

        req.session.userId = newUser.id;

        res.json({ message: "Registration successful", user: newUser });
    } catch (error: any) {
        console.error("[AUTH] Error registering user:", error);
        res.status(400).json({ error: error.message });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await AuthService.login(email);

        req.session.userId = user.id;
        res.json({ message: "Logged in", userId: user.id });
    } catch (error: any) {
        console.error("[AUTH] Error logging in:", error);
        res.status(401).json({ error: error.message });
    }
});

authRouter.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

authRouter.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const user = await AuthService.getUserById(req.session.userId);
        if (!user) return res.status(401).json({ message: "User not found" });

        res.json(user);
    } catch (error: any) {
        console.error("[AUTH] Error fetching user:", error);
        res.status(500).json({ error: error.message });
    }
});

export default authRouter;
