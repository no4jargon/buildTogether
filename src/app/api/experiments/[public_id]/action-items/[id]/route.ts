import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canManageActionItems } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { actionItemUpdateSchema } from '@/lib/validators';

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { public_id: string; id: string } }
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
  const parsed = actionItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const existing = await prisma.actionItem.findUnique({ where: { id: params.id } });
  if (!existing || existing.experimentId !== experiment.id) {
    return jsonError('not_found', 'Action item not found', 404);
  }

  const item = await prisma.actionItem.update({
    where: { id: params.id },
    data: {
      description: parsed.data.description,
      ownerUserId: parsed.data.ownerUserId,
      status: parsed.data.status
    }
  });

  await touchExperiment(experiment.id);

  return jsonOk(item);
};
