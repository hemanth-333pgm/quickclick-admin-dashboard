import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { tokenStorage } from '../utils/tokenStorage';
import type { User } from '../types';
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  sendOtp: (mobile: string) => Promise<{ challengeId: string; devOtp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const normalize = (u: any): User => ({ id: u.id || u._id, _id: u._id || u.id, name: u.name, mobile: u.mobile, email: u.email, role: u.role, status: u.status, avatarUrl: u.avatarUrl });
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(tokenStorage.getUser());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const boot = async () => {
      const token = tokenStorage.getAccess();
      if (token) {
        try {
          const res = await usersApi.getMe();
          const me = normalize(res.data.data);
          setUser(me);
          const rt = tokenStorage.getRefresh()!;
          tokenStorage.set(rt ? token : '', rt, me);
        } catch { tokenStorage.clear(); setUser(null); }
      }
      setLoading(false);
    };
    boot();
  }, []);
  const sendOtp = async (mobile: string) => { const res = await authApi.sendOtp(mobile, 'LOGIN'); return res.data.data; };
  const verifyOtp = async (mobile: string, otp: string) => {
    const res = await authApi.verifyOtp(mobile, otp);
    const { accessToken, refreshToken, user: u } = res.data.data;
    const me = normalize(u);
    if (me.role !== 'ADMIN' && me.role !== 'SUPER_ADMIN') throw new Error('Only admins can access this dashboard');
    tokenStorage.set(accessToken, refreshToken, me);
    setUser(me);
    return me;
  };
  const logout = async () => { try { await authApi.logout(); } finally { tokenStorage.clear(); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, sendOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };
