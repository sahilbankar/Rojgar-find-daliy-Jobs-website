import api from './axios.config';

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  toggleBlockUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/block`);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getEmployers: async () => {
    const response = await api.get('/admin/employers');
    return response.data;
  },
  deleteEmployer: async (id: string) => {
    const response = await api.delete(`/admin/employers/${id}`);
    return response.data;
  },
  getJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },
  updateJobStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/jobs/${id}/status`, { status });
    return response.data;
  },
  deleteJob: async (id: string) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },
  
    getCategories: async () => {
    const response = await api.get('/jobs/categories');
    return response.data;
  },
  createCategory: async (data: any) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
  getJobTypes: async () => {
    const response = await api.get('/jobs/job-types');
    return response.data;
  },
  createJobType: async (data: any) => {
    const response = await api.post('/admin/job-types', data);
    return response.data;
  },
  updateJobType: async (id: string, data: any) => {
    const response = await api.put(`/admin/job-types/${id}`, data);
    return response.data;
  },
  deleteJobType: async (id: string) => {
    const response = await api.delete(`/admin/job-types/${id}`);
    return response.data;
  },
  getApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },
  getContactMessages: async () => {
    const response = await api.get('/contact');
    return response.data;
  },
  deleteContactMessage: async (id: string) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  }
};
