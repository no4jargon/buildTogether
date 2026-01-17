import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';

const getUserId = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
};

export const GET = async () => {
  const userId = await getUserId();
  if (!userId) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { experiment: true },
    orderBy: { createdAt: 'desc' }
  });

  return jsonOk({
    items: bookmarks.map((bookmark) => ({
      publicId: bookmark.experiment.publicId,
      title: bookmark.experiment.title,
      problemStatement: bookmark.experiment.problemStatement,
      maturityStage: bookmark.experiment.maturityStage,
      lastActivityAt: bookmark.experiment.lastActivityAt,
      createdAt: bookmark.createdAt
    }))
  });
};

export const POST = async (request: NextRequest) => {
  const userId = await getUserId();
  if (!userId) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const body = (await request.json()) as { publicId?: string };
  if (!body.publicId) {
    return jsonError('validation_error', 'publicId is required', 400);
  }

  const experiment = await prisma.experiment.findUnique({
    where: { publicId: body.publicId }
  });
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }

  const bookmark = await prisma.bookmark.upsert({
    where: {
      userId_experimentId: { userId, experimentId: experiment.id }
    },
    update: {},
    create: { userId, experimentId: experiment.id }
  });

  return jsonOk({ bookmarked: true, createdAt: bookmark.createdAt });
};

export const DELETE = async (request: NextRequest) => {
  const userId = await getUserId();
  if (!userId) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const body = (await request.json()) as { publicId?: string };
  if (!body.publicId) {
    return jsonError('validation_error', 'publicId is required', 400);
  }

  const experiment = await prisma.experiment.findUnique({
    where: { publicId: body.publicId }
  });
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }

  await prisma.bookmark.deleteMany({
    where: { userId, experimentId: experiment.id }
  });

  return jsonOk({ bookmarked: false });
};
