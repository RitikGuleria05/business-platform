import api from '../api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/Categories/category';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data;
  },
  getById: async (id: string): Promise<Category> => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const res = await api.post('/categories', data);
    return res.data;
  },
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};