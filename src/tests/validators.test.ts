import { describe, expect, it } from 'vitest';

import {
  actionItemCreateSchema,
  experimentCreateSchema,
  interestRequestCreateSchema,
  scopeCreateSchema
} from '@/lib/validators';

describe('validators', () => {
  it('validates experiment creation', () => {
    const result = experimentCreateSchema.parse({
      title: 'Test',
      problemStatement: 'Problem',
      solutionDirection: 'Solution',
      maturityStage: 'idea',
      privacy: 'public',
      currentStatus: 'Starting'
    });

    expect(result.title).toBe('Test');
  });

  it('validates scope creation', () => {
    const result = scopeCreateSchema.parse({
      scopeKey: 'product',
      scopeLabel: 'Product direction',
      ownerUserId: '550e8400-e29b-41d4-a716-446655440000'
    });

    expect(result.scopeKey).toBe('product');
  });

  it('validates action item creation', () => {
    const result = actionItemCreateSchema.parse({
      description: 'Do something',
      ownerUserId: null,
      status: 'open'
    });

    expect(result.status).toBe('open');
  });

  it('validates interest request creation', () => {
    const result = interestRequestCreateSchema.parse({
      why: 'Interested',
      weekOnePlan: 'Plan',
      weeklyHours: 2
    });

    expect(result.weeklyHours).toBe(2);
  });
});
