import axios, { AxiosError } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original: any = error.config;
    const status = error.response?.status;
    const url: string = original?.url || '';
    const skip =
      url.includes('/auth/refresh-token') ||
      url.includes('/auth/send-otp') ||
      url.includes('/auth/verify-otp');

    if (status === 401 && !original._retry && !skip) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();
      if (!refresh) {
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken: refresh,
        });
        const { accessToken, refreshToken } = res.data.data;
        const user = tokenStorage.getUser();
        tokenStorage.set(accessToken, refreshToken, user);
        onRefreshed(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(original);
      } catch (e) {
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (err: unknown): string => {
  const e = err as AxiosError<any>;
  return e.response?.data?.error?.message || (e as Error).message || 'Something went wrong';
};

export const getErrorCode = (err: unknown): string => {
  const e = err as AxiosError<any>;
  return e.response?.data?.error?.code || 'UNKNOWN';
};
