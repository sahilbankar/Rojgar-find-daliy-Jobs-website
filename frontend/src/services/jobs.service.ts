import api from './axios.config';
import { Job } from '../types';

export interface GetJobsParams {
  q?: string;
  location?: string;
  category?: string;
  jobType?: string;
  experience?: string | number;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetJobsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  jobs: Job[];
  data: Job[];
}

export const jobsAPI = {
  // Get all jobs with filters, search, sorting, and pagination
  getJobs: async (params?: GetJobsParams): Promise<GetJobsResponse> => {
    const backendParams: any = {};
    if (params) {
      if (params.q) backendParams.q = params.q;
      if (params.location) backendParams.location = params.location;
      if (params.category && params.category !== 'All') backendParams.category = params.category;
      if (params.jobType && params.jobType !== 'All') backendParams.jobType = params.jobType;
      if (params.experience !== undefined && params.experience !== '' && params.experience !== 'All') {
        backendParams.experience = params.experience;
      }
      if (params.minSalary) backendParams.minSalary = params.minSalary;
      if (params.maxSalary) backendParams.maxSalary = params.maxSalary;
      if (params.page) backendParams.page = params.page;
      if (params.limit) backendParams.limit = params.limit;
      if (params.sortBy) {
        backendParams.sort = params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy;
      }
    }
    const response = await api.get('/jobs', { params: backendParams });
    return response.data;
  },

  // Get single job details by ID
  getJobById: async (id: string): Promise<any> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Update a job (employer only)
  updateJob: async (id: string, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  // Delete a job (employer only)
  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Create a new job post (employer only)
  createJob: async (data: any) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  // Get all job categories
  getCategories: async () => {
    const response = await api.get('/jobs/categories');
    return response.data;
  },

  // Get all job types
  getJobTypes: async () => {
    const response = await api.get('/jobs/job-types');
    return response.data;
  }
};
