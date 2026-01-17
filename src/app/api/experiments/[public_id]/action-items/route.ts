import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canManageActionItems, canViewExperiment } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { actionItemCreateSchema } from '@/lib/validators';

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

  const items = await prisma.actionItem.findMany({
    where: { experimentId: experiment.id },
    orderBy: { createdAt: 'desc' }
  });

  return jsonOk(items);
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

  if (!canManageActionItems(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = actionItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const item = await prisma.actionItem.create({
    data: {
      experimentId: experiment.id,
      description: parsed.data.description,
      ownerUserId: parsed.data.ownerUserId ?? null,
      status: parsed.data.status ?? 'open',
      createdByUserId: user.id
    }
  });

  await touchExperiment(experiment.id);

  return jsonOk(item);
};
