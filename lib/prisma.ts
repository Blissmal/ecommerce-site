import { PrismaClient } from "@/generated/prisma";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Setup the database driver (outside the client)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Pass the adapter to the PrismaClient constructor
export const prisma =
  globalForPrisma.prisma ?? 
  new PrismaClient({ 
    adapter // This replaces the implicit URL lookup
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;