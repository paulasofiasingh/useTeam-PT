import axios from 'axios';
import { Board, Column, Card } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Boards
export const boardsApi = {
  getAll: () => api.get<Board[]>('/boards'),
  getById: (id: string) => api.get<Board>(`/boards/${id}`),
  create: (data: { name: string; description?: string }) => api.post<Board>('/boards', data),
  update: (id: string, data: Partial<Board>) => api.patch<Board>(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),
};

// Columns
export const columnsApi = {
  create: (data: { name: string; boardId: string; position: number }) => 
    api.post<Column>('/columns', data),
  update: (id: string, data: Partial<Column>) => api.patch<Column>(`/columns/${id}`, data),
  delete: (id: string) => api.delete(`/columns/${id}`),
};

// Cards
export const cardsApi = {
  create: (data: { title: string; description?: string; columnId: string; position: number; boardId: string }) => 
    api.post<Card>('/cards', data),
  update: (id: string, data: Partial<Card>) => api.patch<Card>(`/cards/${id}`, data),
  move: (id: string, data: { targetColumnId: string; newPosition: number }) => 
    api.patch<Card>(`/cards/${id}/move`, data),
  delete: (id: string) => api.delete(`/cards/${id}`),
};

export default api;