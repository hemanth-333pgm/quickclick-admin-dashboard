import { axiosClient } from './axiosClient';

export const dashboardApi = {
  get: () => axiosClient.get('/admin/dashboard'),
};
