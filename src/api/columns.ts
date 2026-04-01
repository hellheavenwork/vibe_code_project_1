import { api } from './client';
import { Column } from '../types';

export const getColumns = () => api.get<Column[]>('/columns');
