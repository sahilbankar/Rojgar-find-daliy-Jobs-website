import api from './axios';

export const applicationsAPI = {
  applyForJob: async (jobId: string, data: { coverLetter?: string; resumeUrl?: string; experience?: string }) => {
    const response = await api.post(`/jobs/${jobId}/applications`, data);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  },
  getApplicationDetails: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
  getJobApplicants: async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },
  updateApplicationStatus: async (id: string, status: string) => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  }
};
