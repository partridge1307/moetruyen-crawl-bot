import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') prisma = new PrismaClient();
else {
  const cachedPrisma = globalThis as unknown as {
    prisma: PrismaClient;
  };

  if (!cachedPrisma.prisma) cachedPrisma.prisma = new PrismaClient();
  prisma = cachedPrisma.prisma;
}

export const db = prisma;
