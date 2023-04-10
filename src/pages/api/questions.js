// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

/**
 * @type {PrismaClient}
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const questions = await prisma.questions.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(questions);
  }

  if (req.method === 'PATCH') {
    const {
      // ID of the question
      id,
      // Either 'add' or 'remove'
      action,
    } = req.body;

    await prisma.questions.update({
      where: {
        id: parseInt(id),
      },
      data: {
        upvotes:
          action === 'add'
            ? {
                increment: 1,
              }
            : {
                decrement: 1,
              },
      },
    });

    return res.json({
      message: 'Updated successfully',
    });
  }

  if (req.method === 'POST') {
    const { question } = req.body;

    await prisma.questions.create({
      data: {
        question,
        upvotes: 0,
      },
    });

    return res.json({
      message: 'Created successfully',
    });
  }
}
