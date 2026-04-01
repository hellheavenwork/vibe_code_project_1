import { api } from './client';
import { Task } from '../types';

export const getAllTasks        = ()                          => api.get<Task[]>('/tasks');
export const getTasksByProject = (projectId: string)         => api.get<Task[]>(`/projects/${projectId}/tasks`);
export const createTask        = (body: Omit<Task, 'id' | 'commentsCount'>) => api.post<Task>('/tasks', body);
export const updateTask        = (id: string, body: Partial<Task>)          => api.patch<Task>(`/tasks/${id}`, body);
export const deleteTask        = (id: string)                                => api.delete<void>(`/tasks/${id}`);
