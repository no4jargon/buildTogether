import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canViewExperiment } from '@/lib/permissions';

export const GET = async (
  request: NextRequest,
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

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? '10');

  const journals = await prisma.contributorJournal.findMany({
    where: { experimentId: experiment.id },
    include: { user: true },
    orderBy: { weekStartDate: 'desc' },
    take: limit
  });

  return jsonOk(journals.map((journal) => ({
    ...journal,
    weekStartDate: journal.weekStartDate.toISOString().slice(0, 10)
  })));
};
