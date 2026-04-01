import { api } from './client';
import { Comment } from '../types';

export const getComments   = (taskId: string)                     => api.get<Comment[]>(`/tasks/${taskId}/comments`);
export const addComment    = (taskId: string, text: string)        => api.post<Comment>(`/tasks/${taskId}/comments`, { text });
export const deleteComment = (taskId: string, commentId: string)   => api.delete<void>(`/tasks/${taskId}/comments/${commentId}`);
