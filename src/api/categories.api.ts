import { axiosClient } from './axiosClient';
import type { ApiResponse, Category } from '../types';
export const adminCategoriesApi = {
  list: () => axiosClient.get<ApiResponse<Category[]>>('/admin/categories'),
  create: (payload: Partial<Category>) => axiosClient.post<ApiResponse<Category>>('/admin/categories', payload),
  update: (id: string, payload: Partial<Category>) => axiosClient.put<ApiResponse<Category>>('/admin/categories/' + id, payload),
  remove: (id: string) => axiosClient.delete('/admin/categories/' + id),
};
