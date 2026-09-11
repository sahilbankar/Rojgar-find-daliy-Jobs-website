import api from './axios.config';
import { User, AuthResponse } from '../types';

export const authAPI = {
  // Login endpoint
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register endpoint
  register: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Refresh token endpoint
  refreshToken: async (refreshToken?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout endpoint
  logout: async (refreshToken?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

