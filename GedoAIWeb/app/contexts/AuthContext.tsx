'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ApiClient } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  api: ApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'gedo_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 创建带 token 的 API 客户端
  const api = new ApiClient({
    getToken: () => token,
  });

  // 初始化：从 localStorage 恢复会话
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      // 验证 token 并获取用户信息
      const client = new ApiClient({ getToken: () => savedToken });
      client.me()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token 无效，清除
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const client = new ApiClient();
    const result = await client.login(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(TOKEN_KEY, result.token);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const client = new ApiClient();
    const result = await client.signup(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(TOKEN_KEY, result.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
        api,
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



