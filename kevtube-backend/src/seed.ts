import prisma from './prisma/prismaClient.js';

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

        // 📌 Check if videos exist
        const videoCount = await prisma.video.count();
        if (videoCount > 0) {
            console.log("✅ Videos already exist. No need to seed.");
            return;
        }

        // 📌 Create a Sample Video
        const newVideo = await prisma.video.create({
            data: {
                title: "Example Video",
                transcript: "This is a sample transcript.",
                filePath: "resources/videos/sample.mp4",
                thumbnailUrl: "resources/thumbnails/sample.jpg",
                likes: 0,
                userId: user?.id ?? 1 // If user exists, use its ID
            }
        });

        console.log("🎥 ✅ Video successfully seeded:", newVideo);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}
