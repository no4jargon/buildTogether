import { describe, expect, it } from 'vitest';

import { experimentQuerySchema } from '@/lib/validators';

const encodeCursor = (payload: { lastActivityAt: string; id: string }) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

describe('experiments api query parsing', () => {
  it('accepts cursor query params', () => {
    const cursor = encodeCursor({
      lastActivityAt: new Date().toISOString(),
      id: 'exp1'
    });

    const parsed = experimentQuerySchema.parse({
      q: 'solar',
      stage: 'active',
      privacy: 'public',
      cursor
    });

    expect(parsed.cursor).toBe(cursor);
  });
});
