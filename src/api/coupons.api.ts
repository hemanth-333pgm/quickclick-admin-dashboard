import { axiosClient } from './axiosClient';
import type { ApiResponse, Coupon } from '../types';
export const adminCouponsApi = {
  list: () => axiosClient.get<ApiResponse<Coupon[]>>('/admin/coupons'),
  create: (payload: Partial<Coupon>) => axiosClient.post<ApiResponse<Coupon>>('/admin/coupons', payload),
  update: (id: string, payload: Partial<Coupon>) => axiosClient.put<ApiResponse<Coupon>>('/admin/coupons/' + id, payload),
  remove: (id: string) => axiosClient.delete('/admin/coupons/' + id),
};
