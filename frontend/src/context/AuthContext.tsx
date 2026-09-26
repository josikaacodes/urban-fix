import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrMobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; mobile: string; password: string; city?: string; ward?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserVerification: (mobileVerified?: boolean, idVerified?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('urbanfix_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (token) {
        const res = await apiService.getMe();
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // If token expired or invalid, clear it
      localStorage.removeItem('urbanfix_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (emailOrMobile: string, pass: string) => {
    try {
      const res = await apiService.login(emailOrMobile, pass);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('urbanfix_token', access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid login credentials';
      return { success: false, error: msg };
    }
  };

  const register = async (data: { name: string; email: string; mobile: string; password: string; city?: string; ward?: string }) => {
    try {
      const res = await apiService.register(data);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('urbanfix_token', access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('urbanfix_token');
    setToken(null);
    setUser(null);
  };

  const updateUserVerification = (mobileVerified?: boolean, idVerified?: boolean) => {
    if (user) {
      setUser({
        ...user,
        mobile_verified: mobileVerified !== undefined ? mobileVerified : user.mobile_verified,
        identity_verified: idVerified !== undefined ? idVerified : user.identity_verified,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUserVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
