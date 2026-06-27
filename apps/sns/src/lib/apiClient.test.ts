import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sns api client', () => {
  it('sends credentials and JSON content type for authenticated requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1, username: 'alice' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { apiFetch } = await import('./apiClient');

    const user = await apiFetch<{ username: string }>('/auth/me', {
      method: 'POST',
      body: JSON.stringify({ ping: true }),
    });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/auth/me', {
      method: 'POST',
      body: JSON.stringify({ ping: true }),
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    expect(user.username).toBe('alice');
  });

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const { apiFetch } = await import('./apiClient');

    await expect(apiFetch<void>('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('uses API error messages from JSON responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: ['投稿は必須です', '280文字以内です'] }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const { apiFetch } = await import('./apiClient');

    await expect(apiFetch('/posts', { method: 'POST' })).rejects.toThrow(
      '投稿は必須です\n280文字以内です',
    );
  });
});
