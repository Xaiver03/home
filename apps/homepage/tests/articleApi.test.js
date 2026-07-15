import { afterEach, describe, expect, it, vi } from 'vitest';

import { getLatestArticles } from '@/api';

describe('company article API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects network failures so the homepage can distinguish errors from empty content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));

    await expect(getLatestArticles()).rejects.toThrow('network unavailable');
  });
});
