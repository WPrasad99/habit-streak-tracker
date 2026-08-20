// src/services/prismaClient.js
// Singleton Prisma client — import this everywhere, never instantiate PrismaClient directly.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
