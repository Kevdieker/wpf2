import prisma from './prisma/prismaClient'; // Adjusted relative import
import path from "node:path";

export async function seedDatabase(): Promise<void> {
    try {
        console.log("🔄 Seeding database...");

        // 📌 Ensure at least one user exists (Admin)
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    username: "admin",
                    email: "admin@example.com",
                    password: "securepassword123" // ✅ No hashing (for dev)
                }
            });
            console.log("👤 ✅ Admin User created:", user);
        } else {
            console.log("✅ User already exists:", user.username);
        }

        // 📌 Check if at least one video exists
        const existingVideo = await prisma.video.findFirst();
        if (existingVideo) {
            console.log("✅ Videos already exist. No need to seed.");
            return;
        }

        // 📌 Define Video Paths
        const videoId = 9999; // Static ID for the sample video
        const hlsPath = `videos/${videoId}/stream.m3u8`; // ✅ Direct HLS path
        const thumbnailPath = `thumbnails/${videoId}.jpg`; // ✅ Thumbnail path

        // 📌 Insert Video Data into DB (Assigned to Admin)
        const newVideo = await prisma.video.create({
            data: {
                title: "Example Video",
                description: "This is a sample video for testing.",
                transcript: "This is a sample transcript.",
                videoUrl: hlsPath,
                thumbnailUrl: thumbnailPath,
                uploadDate: new Date(),
                likes: 0,
                views: 0, // ✅ Initialize with 0 views
                userId: user.id // ✅ Assign to first user (Admin)
            }
        });

        console.log("🎥 ✅ Video successfully seeded:", newVideo);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}
