import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canManageScopes } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { scopeCreateSchema } from '@/lib/validators';

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

  if (!canManageScopes(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = scopeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const scope = await prisma.experimentScope.create({
    data: {
      experimentId: experiment.id,
      scopeKey: parsed.data.scopeKey,
      scopeLabel: parsed.data.scopeLabel,
      ownerUserId: parsed.data.ownerUserId
    }
  });

  await touchExperiment(experiment.id);

  return jsonOk(scope);
};
