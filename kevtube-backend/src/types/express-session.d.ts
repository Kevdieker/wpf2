import session from "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: number; // ✅ This defines the userId field inside req.session
    }
}
