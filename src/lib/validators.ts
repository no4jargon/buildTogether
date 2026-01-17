import { z } from 'zod';

export const maturityStageSchema = z.enum([
  'idea',
  'active',
  'validation',
  'paused',
  'archived'
]);

export const privacySchema = z.enum(['public', 'restricted', 'private']);

export const actionStatusSchema = z.enum(['open', 'in_progress', 'done']);

export const interestStatusSchema = z.enum([
  'submitted',
  'accepted',
  'follow_up',
  'declined'
]);

export const experimentCreateSchema = z.object({
  title: z.string().min(2),
  problemStatement: z.string().min(2),
  solutionDirection: z.string().min(2),
  hypothesis: z.string().optional().nullable(),
  falsificationCriteria: z.string().optional().nullable(),
  maturityStage: maturityStageSchema,
  privacy: privacySchema,
  currentStatus: z.string().optional().default(''),
  startDate: z.string().optional().nullable(),
  reviewDate: z.string().optional().nullable()
});

export const experimentUpdateSchema = experimentCreateSchema.partial();

export const scopeCreateSchema = z.object({
  scopeKey: z.string().min(2),
  scopeLabel: z.string().min(2),
  ownerUserId: z.string().uuid()
});

export const scopeUpdateSchema = z.object({
  scopeLabel: z.string().min(2).optional(),
  ownerUserId: z.string().uuid().optional()
});

export const statusLogCreateSchema = z.object({
  entry: z.string().min(2)
});

export const contributorCreateSchema = z.object({
  role: z.string().min(2),
  weeklyHours: z.number().min(0).max(80),
  personalRisk: z.string().optional().nullable()
});

export const interestRequestCreateSchema = z.object({
  why: z.string().min(2),
  weekOnePlan: z.string().min(2),
  weeklyHours: z.number().min(0).max(80)
});

export const interestRequestUpdateSchema = z.object({
  status: interestStatusSchema,
  decisionNote: z.string().optional().nullable()
});

export const actionItemCreateSchema = z.object({
  description: z.string().min(2),
  ownerUserId: z.string().uuid().optional().nullable(),
  status: actionStatusSchema.optional()
});

export const actionItemUpdateSchema = z.object({
  description: z.string().min(2).optional(),
  ownerUserId: z.string().uuid().optional().nullable(),
  status: actionStatusSchema.optional()
});

export const journalUpsertSchema = z.object({
  workedOn: z.string().optional().default(''),
  learned: z.string().optional().default(''),
  blockers: z.string().optional().default(''),
  assetsCreated: z.string().optional().default('')
});

export const assetCreateSchema = z.object({
  assetType: z.string().min(2),
  title: z.string().min(2),
  url: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const experimentQuerySchema = z.object({
  q: z.string().optional(),
  stage: maturityStageSchema.optional(),
  privacy: privacySchema.optional(),
  cursor: z.string().optional()
});
