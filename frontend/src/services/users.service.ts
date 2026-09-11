import api from './axios.config';
import { User } from '../types';

export const usersAPI = {
  
  getProfile: async () => {
    const response = await api.get('/users/me'); // auth/me returns the current user profile
    return response.data;
  },
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  uploadResume: async (formData: FormData) => {
    const response = await api.post('/users/me/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getSavedJobs: async () => {
    const response = await api.get('/users/me/saved-jobs');
    return response.data;
  },
  saveJob: async (jobId: string) => {
    const response = await api.post(`/users/me/saved-jobs/${jobId}`);
    return response.data;
  },
  removeSavedJob: async (jobId: string) => {
    const response = await api.delete(`/users/me/saved-jobs/${jobId}`);
    return response.data;
  }
};
