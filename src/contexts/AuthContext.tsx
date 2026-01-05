import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, adminAuthApi, userApi, adminStaffApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  nickname: string;
  phone?: string;
  role?: string;
  adminRole?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = localStorage.getItem('userType') === 'admin';
  const adminRole = user?.adminRole || user?.role || null;

  if (isAdmin) {
      console.log('Current Admin User State:', user);
      console.log('Detected Admin Role:', adminRole);
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await refreshUser();
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userType = localStorage.getItem('userType');
      
      if (userType === 'admin') {
        // 관리자는 /api/admin/staff/me 엔드포인트로 정보 갱신
        const response = await adminStaffApi.getMe();
        const adminData = response.data?.data || response.data;
        setUser(adminData);
        localStorage.setItem('user', JSON.stringify(adminData));
        return;
      }

      // 일반 유저는 /api/users/me 엔드포인트로 정보 갱신
      const response = await userApi.getMe();
      const userData = response.data?.data || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const accessToken = response.headers['authorization']?.replace('Bearer ', '') 
      || response.data?.accessToken;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userType', 'user');
      await refreshUser();
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const response = await adminAuthApi.login(email, password);
    const accessToken = response.headers['authorization']?.replace('Bearer ', '') 
      || response.data?.accessToken;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userType', 'admin');
      
      // 토큰 저장 후 refreshUser를 통해 서버에서 최신 관리자 정보를 가져옴
      await refreshUser();
    }
  };

  const signup = async (email: string, password: string, nickname: string, phone: string) => {
    await authApi.signup({ email, password, nickname, phone });
  };

  const logout = async () => {
    try {
      if (isAdmin) {
        await adminAuthApi.logout();
      } else {
        await authApi.logout();
      }
    } catch {
      // Continue with logout even if API fails
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        adminRole,
        login,
        adminLogin,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
