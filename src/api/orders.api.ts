import { axiosClient } from './axiosClient';

export const adminOrdersApi = {
  list: (params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => axiosClient.get('/admin/orders', { params }),

  getOne: (id: string) => axiosClient.get('/admin/orders/' + id),

  assign: (orderId: string, deliveryPartnerId: string) =>
    axiosClient.post('/admin/orders/' + orderId + '/assign', { deliveryPartnerId }),
};
