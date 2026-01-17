import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canAddAssets, canViewExperiment } from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { assetCreateSchema } from '@/lib/validators';

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

  const assets = await prisma.reusableAsset.findMany({
    where: { experimentId: experiment.id },
    orderBy: { createdAt: 'desc' }
  });

  return jsonOk(assets);
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

  if (!canAddAssets(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = assetCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const asset = await prisma.reusableAsset.create({
    data: {
      experimentId: experiment.id,
      createdByUserId: user.id,
      assetType: parsed.data.assetType,
      title: parsed.data.title,
      url: parsed.data.url ?? null,
      notes: parsed.data.notes ?? null
    }
  });

  await touchExperiment(experiment.id);

  return jsonOk(asset);
};
