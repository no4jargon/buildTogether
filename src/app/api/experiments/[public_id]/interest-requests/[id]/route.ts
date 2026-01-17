import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canManageInterestRequests } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { interestRequestUpdateSchema } from '@/lib/validators';

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

  if (!canManageInterestRequests(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = interestRequestUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const existing = await prisma.interestRequest.findUnique({
    where: { id: params.id }
  });
  if (!existing || existing.experimentId !== experiment.id) {
    return jsonError('not_found', 'Interest request not found', 404);
  }

  const interest = await prisma.interestRequest.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      decisionNote: parsed.data.decisionNote,
      decisionOwnerUserId: user.id
    }
  });

  if (parsed.data.status === 'accepted') {
    await prisma.experimentContributor.upsert({
      where: {
        experimentId_userId: {
          experimentId: experiment.id,
          userId: interest.userId
        }
      },
      update: { isActive: true },
      create: {
        experimentId: experiment.id,
        userId: interest.userId,
        role: 'Contributor',
        weeklyHours: interest.weeklyHours,
        personalRisk: null
      }
    });
    await touchExperiment(experiment.id);
  }

  return jsonOk(interest);
};
