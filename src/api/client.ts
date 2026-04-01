const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include', // send httpOnly auth cookie automatically — token never exposed to JS
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)                => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string)               => request<T>('DELETE', path),
};
