import { axiosClient } from './axiosClient';
import type { ApiResponse, AuthResponse } from '../types';
export const authApi = {
  sendOtp: (mobile: string, purpose: 'LOGIN' | 'REGISTER' = 'LOGIN') => axiosClient.post<ApiResponse<{ challengeId: string; devOtp?: string }>>('/auth/send-otp', { mobile, purpose }),
  verifyOtp: (mobile: string, otp: string, purpose = 'LOGIN', deviceToken?: string) => axiosClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', { mobile, otp, purpose, deviceToken }),
  logout: () => axiosClient.post('/auth/logout'),
};
