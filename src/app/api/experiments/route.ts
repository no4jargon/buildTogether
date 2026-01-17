import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { generatePublicId } from '@/lib/ids';
import { experimentCreateSchema, experimentQuerySchema } from '@/lib/validators';

const decodeCursor = (cursor: string) => {
  const parsed = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8')) as {
    lastActivityAt: string;
    id: string;
  };
  return {
    lastActivityAt: new Date(parsed.lastActivityAt),
    id: parsed.id
  };
};

const encodeCursor = (item: { lastActivityAt: Date; id: string }) => {
  return Buffer.from(
    JSON.stringify({ lastActivityAt: item.lastActivityAt, id: item.id })
  ).toString('base64');
};

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const parsed = experimentQuerySchema.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    stage: url.searchParams.get('stage') ?? undefined,
    privacy: url.searchParams.get('privacy') ?? undefined,
    cursor: url.searchParams.get('cursor') ?? undefined
  });

  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid query', 400, parsed.error);
  }

  const { q, stage, privacy, cursor } = parsed.data;
  const take = 10;
  const userId = session?.user?.id;

  const searchFilter = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { problemStatement: { contains: q, mode: 'insensitive' as const } }
        ]
      }
    : {};

  const privacyFilter = privacy
    ? { privacy }
    : userId
      ? {
          OR: [
            { privacy: 'public' },
            { privacy: 'restricted' },
            {
              privacy: 'private',
              OR: [
                { createdByUserId: userId },
                { scopes: { some: { ownerUserId: userId } } },
                { contributors: { some: { userId, isActive: true } } }
              ]
            }
          ]
        }
      : { privacy: 'public' };

  const stageFilter = stage ? { maturityStage: stage } : {};

  const cursorFilter = cursor
    ? (() => {
        const decoded = decodeCursor(cursor);
        return {
          OR: [
            { lastActivityAt: { lt: decoded.lastActivityAt } },
            {
              lastActivityAt: decoded.lastActivityAt,
              id: { lt: decoded.id }
            }
          ]
        };
      })()
    : {};

  const items = await prisma.experiment.findMany({
    where: {
      ...searchFilter,
      ...privacyFilter,
      ...stageFilter,
      ...cursorFilter
    },
    orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }],
    take,
    include: userId
      ? {
          bookmarks: {
            where: { userId },
            select: { id: true }
          }
        }
      : undefined
  });

  const nextCursor = items.length === take ? encodeCursor(items[items.length - 1]) : null;

  return jsonOk({
    items: items.map((item) => ({
      publicId: item.publicId,
      title: item.title,
      problemStatement: item.problemStatement,
      maturityStage: item.maturityStage,
      lastActivityAt: item.lastActivityAt,
      isBookmarked: Boolean(item.bookmarks?.length)
    })),
    nextCursor
  });
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const body = await request.json();
  const parsed = experimentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const data = parsed.data;
  const experiment = await prisma.experiment.create({
    data: {
      publicId: generatePublicId(),
      title: data.title,
      problemStatement: data.problemStatement,
      solutionDirection: data.solutionDirection,
      hypothesis: data.hypothesis ?? null,
      falsificationCriteria: data.falsificationCriteria ?? null,
      maturityStage: data.maturityStage,
      privacy: data.privacy,
      currentStatus: data.currentStatus ?? '',
      createdByUserId: session.user.id,
      startDate: data.startDate ? new Date(data.startDate) : null,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : null
    }
  });

  return jsonOk({ publicId: experiment.publicId });
};
