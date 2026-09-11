import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null; // Access token (kept for backward compatibility)
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessTokenStr: string, refreshTokenStr?: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken =
        localStorage.getItem('rojgar_access_token') ||
        localStorage.getItem('rojgar_token');
      const storedRefreshToken = localStorage.getItem('rojgar_refresh_token');
      const storedUser = localStorage.getItem('rojgar_user');

      if (storedAccessToken && storedUser) {
        try {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken || null);
          setUser(JSON.parse(storedUser));

          // Verify token validity and sync user data from backend
          try {
            const profileRes = await authAPI.getProfile();
            if (profileRes && profileRes.user) {
              setUser(profileRes.user);
              localStorage.setItem('rojgar_user', JSON.stringify(profileRes.user));
            }
          } catch (e) {
            // If profile fetch fails, axios interceptor may have refreshed or cleared tokens
            const currentToken = localStorage.getItem('rojgar_access_token');
            if (currentToken) {
              setAccessToken(currentToken);
            }
          }
        } catch (err) {
          console.error('Failed to parse saved user credentials', err);
          localStorage.removeItem('rojgar_access_token');
          localStorage.removeItem('rojgar_refresh_token');
          localStorage.removeItem('rojgar_token');
          localStorage.removeItem('rojgar_user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, accessTokenStr: string, refreshTokenStr?: string) => {
    setUser(userData);
    setAccessToken(accessTokenStr);
    if (refreshTokenStr) setRefreshToken(refreshTokenStr);

    localStorage.setItem('rojgar_access_token', accessTokenStr);
    localStorage.setItem('rojgar_token', accessTokenStr); // for backward compatibility
    if (refreshTokenStr) {
      localStorage.setItem('rojgar_refresh_token', refreshTokenStr);
    }
    localStorage.setItem('rojgar_user', JSON.stringify(userData));
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rojgar_user', JSON.stringify(userData));
  };

  const logout = async () => {
    const currentRefreshToken = refreshToken || localStorage.getItem('rojgar_refresh_token') || undefined;
    try {
      await authAPI.logout(currentRefreshToken);
    } catch (e) {
      // Ignore network / logout errors and proceed with clearing local state
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('rojgar_access_token');
      localStorage.removeItem('rojgar_refresh_token');
      localStorage.removeItem('rojgar_token');
      localStorage.removeItem('rojgar_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: accessToken,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

