import { api } from './client';
import { User } from '../types';

export async function login(username: string, password: string): Promise<User> {
  const data = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
  // Token is set as httpOnly cookie by the server — we only track the session flag here
  localStorage.setItem('isAuthenticated', 'true');
  return data.user;
}

export async function register(
  username: string, password: string, name: string, email?: string
): Promise<User> {
  const data = await api.post<{ token: string; user: User }>(
    '/auth/register', { username, password, name, email }
  );
  // Token is set as httpOnly cookie by the server — we only track the session flag here
  localStorage.setItem('isAuthenticated', 'true');
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {}).catch(() => {});
  // Server clears the httpOnly cookie; we clear the session flag
  localStorage.removeItem('isAuthenticated');
}
