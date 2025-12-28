import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        nextCookies(),
        customSession(async ({ user, session }) => {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    phone: true,
                    phoneVerified: true,
                },
            });

            return {
                user: {
                    ...user,
                    phone: dbUser?.phone,
                    phoneVerified: dbUser?.phoneVerified,
                },
                session,
            };
        }),
    ],
});

// 🔹 Module augmentation to tell TypeScript about extra session fields
declare module "better-auth" {
    interface SessionUser {
        phone?: string;
        phoneVerified: boolean;
    }
}


// Extended user type that includes the custom properties
export type ExtendedUser = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;

    //   extended values
    phone?: string;
    phoneVerified: boolean;
};