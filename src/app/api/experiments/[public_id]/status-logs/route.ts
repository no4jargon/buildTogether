import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canPostStatusLog, canViewExperiment } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { statusLogCreateSchema } from '@/lib/validators';

export const GET = async (
  _request: NextRequest,
  { params }: { params: { public_id: string } }
) => {
  const session = await getServerSession(authOptions);
  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  const experiment = await findExperimentByPublicId(params.public_id);
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }

  if (!canViewExperiment(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const logs = await prisma.experimentStatusLog.findMany({
    where: { experimentId: experiment.id },
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return jsonOk(logs);
};

export const POST = async (
  request: NextRequest,
  { params }: { params: { public_id: string } }
) => {
  const session = await getServerSession(authOptions);
  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  if (!user) {
    return jsonError('unauthorized', 'Sign in required', 401);
  }

  const experiment = await findExperimentByPublicId(params.public_id);
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }

  if (!canPostStatusLog(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = statusLogCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const log = await prisma.experimentStatusLog.create({
    data: {
      experimentId: experiment.id,
      authorUserId: user.id,
      entry: parsed.data.entry
    }
  });

  await touchExperiment(experiment.id);

  return jsonOk(log);
};
