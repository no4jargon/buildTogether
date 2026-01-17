import type {
  Experiment,
  ExperimentContributor,
  ExperimentScope,
  User
} from '@prisma/client';

export type ExperimentAccessContext = Experiment & {
  scopes: ExperimentScope[];
  contributors: ExperimentContributor[];
};

export const isDecisionOwner = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  if (!user) return false;
  return experiment.scopes.some((scope) => scope.ownerUserId === user.id);
};

export const isContributor = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  if (!user) return false;
  return experiment.contributors.some(
    (contributor) => contributor.userId === user.id && contributor.isActive
  );
};

export const canViewExperiment = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  if (experiment.privacy === 'public') return true;
  if (experiment.privacy === 'restricted') return !!user;
  if (!user) return false;
  return (
    experiment.createdByUserId === user.id ||
    isDecisionOwner(user, experiment) ||
    isContributor(user, experiment)
  );
};

export const canEditExperimentCore = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  if (!user) return false;
  return (
    experiment.createdByUserId === user.id || isDecisionOwner(user, experiment)
  );
};

export const canManageScopes = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  return canEditExperimentCore(user, experiment);
};

export const canManageInterestRequests = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  return isDecisionOwner(user, experiment);
};

export const canManageActionItems = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  if (!user) return false;
  return (
    experiment.createdByUserId === user.id ||
    isDecisionOwner(user, experiment) ||
    isContributor(user, experiment)
  );
};

export const canPostStatusLog = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  return canManageActionItems(user, experiment);
};

export const canWriteJournal = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  return isContributor(user, experiment);
};

export const canAddAssets = (
  user: User | null,
  experiment: ExperimentAccessContext
): boolean => {
  return canManageActionItems(user, experiment);
};
