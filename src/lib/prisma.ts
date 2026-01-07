import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";


import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 20000, // 20s
    idleTimeoutMillis: 20000,
    max: 10,
    ssl: {
        rejectUnauthorized: false
    }
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const prisma =
    globalForPrisma.prisma || new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;