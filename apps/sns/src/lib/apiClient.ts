const API_URL = import.meta.env.VITE_API_URL;

export function clearToken(): void {
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', { method: 'POST' }).catch(() => undefined);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    clearToken();
    location.hash = "#/login";
    throw new Error("ログインが必要です");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join("\n")
      : body?.message;
    throw new Error(message ?? `エラーが発生しました（${res.status}）`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
