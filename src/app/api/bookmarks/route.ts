import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canViewExperiment } from '@/lib/permissions';

const getSessionUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: session.user.id } });
};

export const GET = async () => {
  const user = await getSessionUser();
  if (!user) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      experiment: {
        include: {
          scopes: true,
          contributors: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return jsonOk({
    items: bookmarks
      .filter((bookmark) => canViewExperiment(user, bookmark.experiment))
      .map((bookmark) => ({
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
  const user = await getSessionUser();
  if (!user) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const body = (await request.json()) as { publicId?: string };
  if (!body.publicId) {
    return jsonError('validation_error', 'publicId is required', 400);
  }

  const experiment = await findExperimentByPublicId(body.publicId);
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }
  if (!canViewExperiment(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const bookmark = await prisma.bookmark.upsert({
    where: {
      userId_experimentId: { userId: user.id, experimentId: experiment.id }
    },
    update: {},
    create: { userId: user.id, experimentId: experiment.id }
  });

  return jsonOk({ bookmarked: true, createdAt: bookmark.createdAt });
};

export const DELETE = async (request: NextRequest) => {
  const user = await getSessionUser();
  if (!user) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const body = (await request.json()) as { publicId?: string };
  if (!body.publicId) {
    return jsonError('validation_error', 'publicId is required', 400);
  }

  const experiment = await findExperimentByPublicId(body.publicId);
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }
  if (!canViewExperiment(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  await prisma.bookmark.deleteMany({
    where: { userId: user.id, experimentId: experiment.id }
  });

  return jsonOk({ bookmarked: false });
};
