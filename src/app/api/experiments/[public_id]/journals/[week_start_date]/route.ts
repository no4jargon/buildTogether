import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import { canWriteJournal } from '@/lib/permissions';
import { journalUpsertSchema } from '@/lib/validators';

export const PUT = async (
  request: NextRequest,
  { params }: { params: { public_id: string; week_start_date: string } }
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

  if (!canWriteJournal(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = journalUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const weekStartDate = new Date(params.week_start_date);
  if (Number.isNaN(weekStartDate.getTime())) {
    return jsonError('validation_error', 'Invalid week start date', 400);
  }

  const journal = await prisma.contributorJournal.upsert({
    where: {
      experimentId_userId_weekStartDate: {
        experimentId: experiment.id,
        userId: user.id,
        weekStartDate
      }
    },
    update: {
      workedOn: parsed.data.workedOn,
      learned: parsed.data.learned,
      blockers: parsed.data.blockers,
      assetsCreated: parsed.data.assetsCreated
    },
    create: {
      experimentId: experiment.id,
      userId: user.id,
      weekStartDate,
      workedOn: parsed.data.workedOn,
      learned: parsed.data.learned,
      blockers: parsed.data.blockers,
      assetsCreated: parsed.data.assetsCreated
    }
  });

  return jsonOk(journal);
};
