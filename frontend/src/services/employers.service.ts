import api from './axios.config';

export const employersAPI = {
  getEmployerById: async (id: string) => {
    const response = await api.get(`/employers/public/${id}`);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/employers/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/employers/me', data);
    return response.data;
  },
  uploadLogo: async (formData: FormData) => {
    const response = await api.post('/employers/me/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getJobs: async () => {
    const response = await api.get('/employers/me/jobs');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/employers/me/stats');
    return response.data;
  },
  getApplicants: async () => {
    const response = await api.get('/employers/me/applicants');
    return response.data;
  }
};
