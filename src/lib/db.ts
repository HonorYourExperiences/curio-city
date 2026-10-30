import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { bydtDb?: PrismaClient };
export const db = globalDb.bydtDb ?? new PrismaClient({ log: [] });
if (process.env.NODE_ENV !== "production") globalDb.bydtDb = db;
