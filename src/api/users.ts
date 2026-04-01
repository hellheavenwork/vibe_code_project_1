import { api } from './client';
import { User } from '../types';

export const getUsers   = ()                                                => api.get<User[]>('/users');
export const getMe      = ()                                                => api.get<User>('/users/me');
export const updateMe   = (body: Partial<User>)                             => api.patch<User>('/users/me', body);
export const updateUser = (id: string, body: Partial<User> & { password?: string }) =>
  api.patch<User>(`/users/${id}`, body);
export const deleteUser = (id: string)                                      => api.delete<void>(`/users/${id}`);
