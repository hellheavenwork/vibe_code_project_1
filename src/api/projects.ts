import { api } from './client';
import { Project } from '../types';

export const getProjects   = ()                                              => api.get<Project[]>('/projects');
export const getProject    = (id: string)                                    => api.get<Project>(`/projects/${id}`);
export const createProject = (body: { name: string; color?: string })        => api.post<Project>('/projects', body);
export const updateProject = (id: string, body: Partial<Project>)            => api.patch<Project>(`/projects/${id}`, body);
export const deleteProject = (id: string)                                    => api.delete<void>(`/projects/${id}`);
