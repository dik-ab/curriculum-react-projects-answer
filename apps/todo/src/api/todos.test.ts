import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTodo, deleteTodo } from './todos';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('todo api client', () => {
  it('sends JSON when creating a todo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          title: 'Write tests',
          completed: false,
          createdAt: '2026-06-28T00:00:00.000Z',
          updatedAt: '2026-06-28T00:00:00.000Z',
        }),
        { status: 201, statusText: 'Created' },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const todo = await createTodo('Write tests');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Write tests' }),
    });
    expect(todo.title).toBe('Write tests');
  });

  it('throws an API error when delete fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 404, statusText: 'Not Found' })),
    );

    await expect(deleteTodo(999)).rejects.toThrow('APIエラー: 404 Not Found');
  });
});
