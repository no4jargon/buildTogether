import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';
import { prisma } from '@/lib/db';
import { findExperimentByPublicId } from '@/lib/experiments';
import {
  canAddAssets,
  canEditExperimentCore,
  canManageActionItems,
  canManageInterestRequests,
  canManageScopes,
  canPostStatusLog,
  canViewExperiment,
  canWriteJournal,
  isContributor
} from '@/lib/permissions';
import { touchExperiment } from '@/lib/touch';
import { experimentUpdateSchema } from '@/lib/validators';

export const GET = async (
  _request: NextRequest,
  { params }: { params: { public_id: string } }
) => {
  const session = await getServerSession(authOptions);
  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  const experiment = await findExperimentByPublicId(params.public_id, user?.id);
  if (!experiment) {
    return jsonError('not_found', 'Experiment not found', 404);
  }

  if (!canViewExperiment(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const members = new Map<string, { id: string; name: string }>();
  members.set(experiment.creator.id, {
    id: experiment.creator.id,
    name: experiment.creator.name
  });
  experiment.contributors.forEach((contributor) => {
    members.set(contributor.user.id, {
      id: contributor.user.id,
      name: contributor.user.name
    });
  });
  experiment.scopes.forEach((scope) => {
    members.set(scope.owner.id, { id: scope.owner.id, name: scope.owner.name });
  });

  return jsonOk({
    experiment: {
      publicId: experiment.publicId,
      title: experiment.title,
      problemStatement: experiment.problemStatement,
      solutionDirection: experiment.solutionDirection,
      hypothesis: experiment.hypothesis,
      falsificationCriteria: experiment.falsificationCriteria,
      maturityStage: experiment.maturityStage,
      privacy: experiment.privacy,
      currentStatus: experiment.currentStatus,
      lastActivityAt: experiment.lastActivityAt,
      createdByUserId: experiment.createdByUserId,
      startDate: experiment.startDate,
      reviewDate: experiment.reviewDate,
      isBookmarked: Boolean(experiment.bookmarks?.length)
    },
    scopes: experiment.scopes,
    contributors: experiment.contributors,
    permissions: {
      canEditCore: canEditExperimentCore(user, experiment),
      canManageScopes: canManageScopes(user, experiment),
      canManageInterestRequests: canManageInterestRequests(user, experiment),
      canManageActionItems: canManageActionItems(user, experiment),
      canPostStatusLog: canPostStatusLog(user, experiment),
      canWriteJournal: canWriteJournal(user, experiment),
      canAddAssets: canAddAssets(user, experiment)
    },
    members: Array.from(members.values()),
    isContributor: isContributor(user, experiment)
  });
};

export const PATCH = async (
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

  if (!canEditExperimentCore(user, experiment)) {
    return jsonError('forbidden', 'Access denied', 403);
  }

  const body = await request.json();
  const parsed = experimentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation_error', 'Invalid payload', 400, parsed.error);
  }

  const data = parsed.data;

  const updatePayload: Record<string, unknown> = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.problemStatement !== undefined) {
    updatePayload.problemStatement = data.problemStatement;
  }
  if (data.solutionDirection !== undefined) {
    updatePayload.solutionDirection = data.solutionDirection;
  }
  if (data.hypothesis !== undefined) updatePayload.hypothesis = data.hypothesis;
  if (data.falsificationCriteria !== undefined) {
    updatePayload.falsificationCriteria = data.falsificationCriteria;
  }
  if (data.maturityStage !== undefined) {
    updatePayload.maturityStage = data.maturityStage;
  }
  if (data.privacy !== undefined) updatePayload.privacy = data.privacy;
  if (data.currentStatus !== undefined) {
    updatePayload.currentStatus = data.currentStatus;
  }
  if (data.startDate !== undefined) {
    updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.reviewDate !== undefined) {
    updatePayload.reviewDate = data.reviewDate ? new Date(data.reviewDate) : null;
  }

  const updated = await prisma.experiment.update({
    where: { id: experiment.id },
    data: updatePayload
  });

  await touchExperiment(updated.id);

  return jsonOk({ publicId: updated.publicId });
};
