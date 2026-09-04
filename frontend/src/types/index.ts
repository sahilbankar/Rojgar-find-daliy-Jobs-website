export type UserRole = 'jobseeker' | 'employer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt?: string;
  skills?: string[];
  location?: string;
  experience?: string;
  education?: string;
  availabilityStatus?: string;
  savedJobs?: string[];
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
  token?: string; // fallback
}


export interface JobCategory {
  _id: string;
  name: string;
  icon?: string;
  slug?: string;
}

export interface Job {
  _id: string;
  title: string;
  companyName: string;
  employerId?: any;
  category?: string;
  categoryId?: any;
  location: string;
  jobType?: string;
  vacancies?: number;
  totalVacancies?: number;
  remainingVacancies?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  experience?: string | number;
  experienceYears?: string | number;
  description: string;
  requirements?: string[];
  applicationDeadline?: string | Date;
  isActive?: boolean;
  status?: string;
  adminStatus?: string;
  createdAt: string;
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

export interface Application {
  _id: string;
  jobId: string | Job;
  applicantId: string | User;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
}
