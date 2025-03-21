import { PrismaClient } from "@prisma/client";

// Ensuring a single instance of PrismaClient is used across hot reloads in development.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Reuse the existing PrismaClient instance if available; otherwise, create a new one.
export const prisma =
  globalForPrisma.prisma || new PrismaClient();

// In development, store the Prisma instance in the global object to prevent multiple instances.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
