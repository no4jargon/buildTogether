import { describe, expect, it } from 'vitest';
import { Prisma, type Experiment, type ExperimentContributor, type ExperimentScope, type User } from '@prisma/client';

import {
  canAddAssets,
  canEditExperimentCore,
  canManageActionItems,
  canManageInterestRequests,
  canManageScopes,
  canPostStatusLog,
  canViewExperiment,
  canWriteJournal,
  isDecisionOwner,
  isContributor,
  type ExperimentAccessContext
} from '@/lib/permissions';

const baseExperiment = (overrides?: Partial<Experiment>): Experiment => ({
  id: 'exp1',
  publicId: 'pub1',
  title: 'Test',
  problemStatement: 'Problem',
  solutionDirection: 'Solution',
  hypothesis: null,
  falsificationCriteria: null,
  maturityStage: 'active',
  privacy: 'public',
  createdByUserId: 'user1',
  currentStatus: '',
  lastActivityAt: new Date(),
  startDate: null,
  reviewDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const baseUser = (id: string): User => ({
  id,
  email: `${id}@example.com`,
  name: id,
  bio: null,
  createdAt: new Date(),
  lastLoginAt: null
});

const baseScope = (ownerUserId: string): ExperimentScope => ({
  id: 'scope1',
  experimentId: 'exp1',
  scopeKey: 'product',
  scopeLabel: 'Product',
  ownerUserId
});

const baseContributor = (userId: string): ExperimentContributor => ({
  id: 'contrib1',
  experimentId: 'exp1',
  userId,
  role: 'Contributor',
  weeklyHours: new Prisma.Decimal(5),
  personalRisk: null,
  joinedAt: new Date(),
  isActive: true
});

describe('permissions', () => {
  it('allows public viewing for anyone', () => {
    const experiment: ExperimentAccessContext = {
      ...baseExperiment({ privacy: 'public' }),
      scopes: [],
      contributors: []
    };

    expect(canViewExperiment(null, experiment)).toBe(true);
  });

  it('requires decision owner for managing interest requests', () => {
    const user = baseUser('user2');
    const experiment: ExperimentAccessContext = {
      ...baseExperiment({ privacy: 'restricted' }),
      scopes: [baseScope(user.id)],
      contributors: []
    };

    expect(isDecisionOwner(user, experiment)).toBe(true);
    expect(canManageInterestRequests(user, experiment)).toBe(true);
  });

  it('allows contributors to manage action items and post status logs', () => {
    const user = baseUser('user3');
    const experiment: ExperimentAccessContext = {
      ...baseExperiment({ privacy: 'private' }),
      scopes: [],
      contributors: [baseContributor(user.id)]
    };

    expect(isContributor(user, experiment)).toBe(true);
    expect(canManageActionItems(user, experiment)).toBe(true);
    expect(canPostStatusLog(user, experiment)).toBe(true);
    expect(canAddAssets(user, experiment)).toBe(true);
  });

  it('only contributors can write journals', () => {
    const user = baseUser('user4');
    const experiment: ExperimentAccessContext = {
      ...baseExperiment({ privacy: 'private' }),
      scopes: [],
      contributors: []
    };

    expect(canWriteJournal(user, experiment)).toBe(false);
  });

  it('creator or decision owner can edit core fields', () => {
    const creator = baseUser('user1');
    const decisionOwner = baseUser('user5');
    const experiment: ExperimentAccessContext = {
      ...baseExperiment({ privacy: 'private' }),
      scopes: [baseScope(decisionOwner.id)],
      contributors: []
    };

    expect(canEditExperimentCore(creator, experiment)).toBe(true);
    expect(canManageScopes(decisionOwner, experiment)).toBe(true);
  });
});
