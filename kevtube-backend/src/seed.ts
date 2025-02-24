import prisma from './prisma/prismaClient';

export async function seedDatabase(): Promise<void> {
    try {
        console.log("🔄 Seeding database...");

        // Optional: Vorhandene Daten löschen
        await prisma.like.deleteMany({});
        await prisma.comment.deleteMany({});
        await prisma.video.deleteMany({});
        await prisma.user.deleteMany({});

        // Definiere 12 Benutzer, einer davon ist Kevin
        const usersData = [
            { username: "kevin", email: "test@test", password: "test" },
            { username: "user1", email: "user1@example.com", password: "password1" },
            { username: "user2", email: "user2@example.com", password: "password2" },
            { username: "user3", email: "user3@example.com", password: "password3" },
            { username: "user4", email: "user4@example.com", password: "password4" },
            { username: "user5", email: "user5@example.com", password: "password5" },
            { username: "user6", email: "user6@example.com", password: "password6" },
            { username: "user7", email: "user7@example.com", password: "password7" },
            { username: "user8", email: "user8@example.com", password: "password8" },
            { username: "user9", email: "user9@example.com", password: "password9" },
            { username: "user10", email: "user10@example.com", password: "password10" },
            { username: "user11", email: "user11@example.com", password: "password11" }
        ];

        const createdUsers = [];
        for (const userData of usersData) {
            const user = await prisma.user.create({ data: userData });
            console.log(`👤 Created user: ${user.username}`);
            createdUsers.push(user);
        }

        // Erstes Video: "Example Video"
        const video1 = await prisma.video.create({
            data: {
                title: "Example Video",
                description: "This is a sample video for testing.",
                transcript: "This is a sample transcript.",
                // Direkte URL zur MP4-Datei
                videoUrl: "http://localhost:8088/resources/videos/input.mp4",
                // Direkte URL zum Thumbnail
                thumbnailUrl: "http://localhost:8088/resources/sample.jpg",
                uploadDate: new Date(),
                likes: 0,
                views: 0,
                userId: createdUsers[0].id // Kevin
            }
        });
        console.log("🎥 Created first video:", video1);

        // Zweites Video: "Second Video"
        const video2 = await prisma.video.create({
            data: {
                title: "Second Video",
                description: "This is the second sample video.",
                transcript: "This is the transcript for the second video.",
                videoUrl: "http://localhost:8088/resources/videos/input.mp4",
                thumbnailUrl: "http://localhost:8088/resources/sample.jpg",
                uploadDate: new Date(),
                likes: 0,
                views: 0,
                userId: createdUsers[1].id // user1
            }
        });
        console.log("🎥 Created second video:", video2);

        console.log("✅ Seeding completed.");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}

// Falls das Skript direkt ausgeführt wird
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log("Database seeded successfully.");
            process.exit(0);
        })
        .catch((e) => {
            console.error("Error seeding database:", e);
            process.exit(1);
        });
}
