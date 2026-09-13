import { axiosClient } from './axiosClient';

export const adminDeliveryApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    axiosClient.get('/admin/delivery-partners', { params }),
  getOne: (id: string) => axiosClient.get('/admin/delivery-partners/' + id),
  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') =>
    axiosClient.patch('/admin/delivery-partners/' + id + '/status', { status }),
  jobs: () => axiosClient.get('/admin/orders', { params: { limit: 500 } }),
};
