import prisma from './prisma/prismaClient'; // Adjusted relative import
import path from "node:path";

export async function seedDatabase(): Promise<void> {
    try {
        // 📌 Check if a User already exists
        const userCount = await prisma.user.count();
        let user;

        if (userCount === 0) {
            user = await prisma.user.create({
                data: {
                    username: "admin",
                    email: "admin@example.com",
                    password: "securepassword123" // ✅ Later, hash this password!
                }
            });
            console.log("👤 ✅ User created:", user);
        } else {
            user = await prisma.user.findFirst();
            console.log("✅ User already exists:", user?.username);
        }

        /* 📌 Check if videos exist
        const videoCount = await prisma.video.count();
        if (videoCount > 1) {
            console.log("✅ Videos already exist. No need to seed.");
            return;
        }*/

        // 📌 Define Correct Video Paths
        const videoId = 9999; // Static ID for the sample video
        const videoFolder = path.join(__dirname, "..", "resources", "videos", `${videoId}`);
        const hlsPath = `videos/${videoId}/stream.m3u8`; // ✅ Direct HLS path
        const thumbnailPath = `thumbnails/${videoId}.jpg`; // ✅ Thumbnail path

        // 📌 Insert Video Data into DB (WITHOUT MP4 CONVERSION)
        const newVideo = await prisma.video.create({
            data: {
                title: "Example Video",
                transcript: "This is a sample transcript.",
                filePath: hlsPath,
                thumbnailUrl: thumbnailPath,
                likes: 0,
                userId: user?.id ?? 1
            }
        });

        console.log("🎥 ✅ Video successfully seeded:", newVideo);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}
