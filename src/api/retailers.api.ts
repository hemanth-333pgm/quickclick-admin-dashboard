import { axiosClient } from './axiosClient';

export const adminRetailersApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    axiosClient.get('/admin/retailers', { params }),
  getOne: (id: string) => axiosClient.get('/admin/retailers/' + id),
  updateStatus: (
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
    remarks?: string
  ) => axiosClient.patch('/admin/retailers/' + id + '/status', { status, remarks }),
  products: (id: string) =>
    axiosClient.get('/products', { params: { retailerId: id, limit: 100 } }),
  orders: () => axiosClient.get('/admin/orders', { params: { limit: 500 } }),
};
