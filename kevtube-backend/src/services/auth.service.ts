import prisma from '../prisma/prismaClient';

export class AuthService {

    static async register(username: string, email: string, password: string) {
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const newUser = await prisma.user.create({
            data: {username, email, password},
        });

        return newUser;
    }

    static async login(email: string) {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) throw new Error("Invalid credentials");
        return user;
    }

    static async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {id: true, username: true}
        });

        return user;
    }
}
