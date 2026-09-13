import { axiosClient } from './axiosClient';
import type { ApiResponse, User } from '../types';

export const usersApi = {
  getMe: () => axiosClient.get<ApiResponse<User>>('/users/me'),
  updateMe: (payload: { name?: string; email?: string; avatarUrl?: string }) =>
    axiosClient.put<ApiResponse<User>>('/users/me', payload),
};

export const adminUsersApi = {
  list: (params: { role?: string; status?: string; page?: number; limit?: number }) =>
    axiosClient.get('/admin/users', { params }),
  getOne: (id: string) => axiosClient.get('/admin/users/' + id),
  updateStatus: (id: string, status: string, reason?: string) =>
    axiosClient.patch('/admin/users/' + id + '/status', { status, reason }),
  ordersByUser: (id: string) =>
    axiosClient.get('/admin/orders', { params: { userId: id, limit: 100 } }),
};
