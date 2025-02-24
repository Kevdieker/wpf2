import prisma from './prisma/prismaClient';

export async function seedDatabase(): Promise<void> {
    try {
        console.log("🔄 Seeding database...");

        await prisma.like.deleteMany({});
        await prisma.comment.deleteMany({});
        await prisma.video.deleteMany({});
        await prisma.user.deleteMany({});

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

        for (let i = 1; i <= 10; i++) {
            const video = await prisma.video.create({
                data: {
                    title: `Sample Video ${i}`,
                    description: `This is the description for Sample Video ${i}.`,
                    transcript: `Transcript for Sample Video ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                    videoUrl: "http://localhost:8088/resources/videos/input.mp4",  // MP4-URL
                    thumbnailUrl: "http://localhost:8088/resources/sample.jpg",   // Thumbnail-URL
                    uploadDate: new Date(),
                    likes: 0,
                    views: 0,
                    userId: createdUsers[(i - 1) % createdUsers.length].id
                }
            });
            console.log(`🎥 Created video ${i}:`, video);
        }

        console.log(" Seeding completed.");
    } catch (error) {
        console.error("Error seeding database:", error);
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
