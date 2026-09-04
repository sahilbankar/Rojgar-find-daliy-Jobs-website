import React, { useState } from 'react';
import {
  Briefcase, Users, PlusCircle, User as UserIcon, Building, Edit3, X,
  Menu, LayoutDashboard, TrendingUp, XCircle, Bell, MapPin, Clock,
  DollarSign, Eye, Trash2, ChevronDown, ChevronUp, AlertTriangle,
  Loader2, Calendar, Upload, Search, Download, FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { jobsAPI } from '../../services/jobs';
import { applicationsAPI } from '../../services/applications';
import { employersAPI } from '../../services/employers';

type Tab = 'overview' | 'profile' | 'jobs' | 'post-job' | 'applicants';

const FIELD_CLS = 'w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors';
const LABEL_CLS = 'block text-xs font-bold text-gray-700 uppercase tracking-wide';
const REQ = <span className="text-red-500 ml-0.5">*</span>;

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // stats
  const [jobs, setJobs] = useState<any[]>([]);
  
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  const [searchApplicantQuery, setSearchApplicantQuery] = useState('');
  const [filterAppJob, setFilterAppJob] = useState('');
  const [filterAppStatus, setFilterAppStatus] = useState('');
  const [applicantViewModal, setApplicantViewModal] = useState<any>(null);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [applicantsError, setApplicantsError] = useState("");

  const [stats, setStats] = useState({
    totalJobs: 0, activeJobs: 0, closedJobs: 0,
    totalApplications: 0, newApplications: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    phone: '',
    location: '',
    address: '',
    website: '',
    companyDescription: ''
  });

  // Post a Job form
  const INITIAL_POST_FORM = {
    title: '', description: '', requirements: '', categoryId: '', jobType: '',
    location: '', minSalary: '', maxSalary: '',
    experience: 'Fresher', totalVacancies: '', applicationDeadline: '',
  };
  const [postForm, setPostForm] = React.useState(INITIAL_POST_FORM);
  const [postLoading, setPostLoading] = React.useState(false);
  const [postError, setPostError] = React.useState('');
  const [postSuccess, setPostSuccess] = React.useState(false);
  const [categories, setCategories] = React.useState<{ _id: string; name: string }[]>([]);
  const [jobTypes, setJobTypes] = React.useState<{ _id: string; name: string }[]>([]);

  // My Jobs state
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any>(null);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [jobViewModal, setJobViewModal] = useState<any>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Handlers\n
  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      await applicationsAPI.updateApplicationStatus(appId, status);
      setAllApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      let res = await employersAPI.updateProfile(profileForm);
      
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        res = await employersAPI.uploadLogo(formData);
      }
      
      setProfile(res.data);
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err: any) {
      
      alert(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };



  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const fetchApplicantCounts = async (jobList: any[]) => {
    const counts: Record<string, number> = {};
    await Promise.all(
      jobList.map(async (job: any) => {
        try {
          const res = await applicationsAPI.getJobApplicants(job._id);
          counts[job._id] = res.count ?? (res.data?.length ?? 0);
        } catch {
          counts[job._id] = 0;
        }
      })
    );
    setApplicantCounts(counts);
  };

  React.useEffect(() => {
    setJobsLoading(true);
    employersAPI.getJobs()
      .then(res => {
        const jobList = res.data || [];
        setJobs(jobList);
        setJobsLoading(false);
        fetchApplicantCounts(jobList);
      })
      .catch(() => setJobsLoading(false));

    setApplicantsLoading(true);
    setApplicantsError('');
    employersAPI.getApplicants()
      .then(res => {
        setAllApplicants(res.data || []);
        setApplicantsLoading(false);
      })
      .catch((err) => {
        
        setApplicantsError(err?.response?.data?.message || 'Failed to load applicants.');
        setApplicantsLoading(false);
      });

    employersAPI.getStats()
      .then(res => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    employersAPI.getProfile()
      .then(res => {
        const data = res.data || {};
        setProfile(data);
        setProfileForm({
          companyName: data.companyName || '',
          phone: data.phone || '',
          location: data.location || '',
          address: data.address || '',
          website: data.website || '',
          companyDescription: data.companyDescription || ''
        });
      })
      .catch(() => {});

    jobsAPI.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {});

    jobsAPI.getJobTypes()
      .then(res => setJobTypes(res.data || []))
      .catch(() => {});
  }, []);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    setPostLoading(true);
    try {
      const salaryRange = postForm.minSalary && postForm.maxSalary
        ? `Rs.${Number(postForm.minSalary).toLocaleString('en-IN')} - Rs.${Number(postForm.maxSalary).toLocaleString('en-IN')}`
        : postForm.minSalary
        ? `Rs.${Number(postForm.minSalary).toLocaleString('en-IN')}+`
        : '';

      let requirementsArray: string[] = [];
      if (postForm.requirements && postForm.requirements.trim()) {
        if (postForm.requirements.includes('\n')) {
          requirementsArray = postForm.requirements
            .split('\n')
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0);
        } else if (postForm.requirements.includes(',')) {
          requirementsArray = postForm.requirements
            .split(',')
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0);
        } else {
          requirementsArray = [postForm.requirements.trim()];
        }
      }

      const payload: Record<string, unknown> = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        requirements: requirementsArray,
        categoryId: postForm.categoryId,
        jobType: postForm.jobType,
        location: postForm.location.trim(),
        salaryRange,
        experience: postForm.experience || 'Fresher',
        totalVacancies: Number(postForm.totalVacancies),
      };
      if (postForm.applicationDeadline) {
        payload.applicationDeadline = postForm.applicationDeadline;
      }

      const res = await jobsAPI.createJob(payload);

      if (res && (res.success || res.data)) {
        setPostSuccess(true);
        setPostForm(INITIAL_POST_FORM);
        employersAPI.getJobs().then(res => {
          const updated = res.data || [];
          setJobs(updated);
          fetchApplicantCounts(updated);
        });
        employersAPI.getStats().then(res => setStats(res.data)).catch(() => {});
      } else {
        setPostError(res?.message || 'Failed to post job. Please try again.');
      }
    } catch (err: any) {
      
      setPostError(err?.response?.data?.message || err?.message || 'Failed to post job. Please try again.');
    } finally {
      setPostLoading(false);
    }
  };

  const getStatusBadge = (job: any) => {
    if (job.isActive)
      return { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (job.adminStatus === 'Pending')
      return { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (job.adminStatus === 'Rejected')
      return { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' };
    return { label: 'Closed', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleteLoading(true);
    try {
      await jobsAPI.deleteJob(jobToDelete._id);
      const updated = jobs.filter((j: any) => j._id !== jobToDelete._id);
      setJobs(updated);
      fetchApplicantCounts(updated);
      employersAPI.getStats().then(res => setStats(res.data)).catch(() => {});
      setJobToDelete(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToEdit) return;
    setEditLoading(true);
    try {
      const res = await jobsAPI.updateJob(jobToEdit._id, jobToEdit);
      setJobs(prev => prev.map((j: any) => j._id === jobToEdit._id ? res.data : j));
      setJobToEdit(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update job.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewApplicants = (job: any) => {
    setSelectedJobForApplicants(job);
    setActiveTab('applicants');
  };

  const handleDownloadResume = (url: string, name?: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${name || 'applicant'}_resume`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    { label: 'Total Jobs Posted', value: stats.totalJobs, icon: Briefcase, bg: 'bg-indigo-50', border: 'border-indigo-100', iconBg: 'bg-indigo-600', textColor: 'text-indigo-600', valueColor: 'text-indigo-950' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: TrendingUp, bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-600', textColor: 'text-emerald-600', valueColor: 'text-emerald-950' },
    { label: 'Closed Jobs', value: stats.closedJobs, icon: XCircle, bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-500', textColor: 'text-red-500', valueColor: 'text-red-950' },
    { label: 'Total Applications', value: stats.totalApplications, icon: Users, bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-600', textColor: 'text-purple-600', valueColor: 'text-purple-950' },
    { label: 'New Applications', subtitle: 'Last 7 days', value: stats.newApplications, icon: Bell, bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-500', textColor: 'text-amber-600', valueColor: 'text-amber-950' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Welcome, {user?.name || 'Employer'}! 👋</h2>
          <p className="text-sm text-gray-500">Here's a snapshot of your hiring activity.</p>
        </div>
        <button
          onClick={() => setActiveTab('post-job')}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition-all w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Job</span>
        </button>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {[...Array(5)].map((_, i) => <div key={i} className="p-4 bg-gray-100 border border-gray-200 rounded-2xl animate-pulse h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`p-5 ${card.bg} border ${card.border} rounded-2xl flex items-center space-x-4 shadow-sm`}>
                <div className={`p-3 ${card.iconBg} text-white rounded-xl flex-shrink-0`}><Icon className="w-6 h-6" /></div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${card.textColor}`}>{card.label}</p>
                  {'subtitle' in card && card.subtitle && <p className="text-[10px] text-gray-400">{card.subtitle}</p>}
                  <p className={`text-3xl font-black ${card.valueColor}`}>{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Recent Job Postings</h3>
            <button onClick={() => setActiveTab('jobs')} className="text-xs text-blue-600 hover:underline font-semibold">View All →</button>
          </div>
          <div className="divide-y divide-gray-100">
            {jobs.slice(0, 3).map((job: any) => (
              <div key={job._id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.location} · {job.jobType}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${job.isActive ? 'bg-emerald-100 text-emerald-700' : job.adminStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : job.adminStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {job.isActive ? 'Active' : (job.adminStatus === 'Pending' ? 'Pending Review' : job.adminStatus || 'Closed')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    if (isEditingProfile) {
      return (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Edit Employer Profile</h2>
            <button type="button" onClick={() => { setIsEditingProfile(false); setLogoFile(null); setLogoPreview(null); }} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {logoPreview || profile?.logoUrl ? (
                <img src={logoPreview || (profile.logoUrl.startsWith('http') ? profile.logoUrl : `http://localhost:5000${profile.logoUrl}`)} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building className="w-10 h-10 text-blue-400" />
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Company Logo</h3>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 256x256px. Max size: 2MB.</p>
              {logoFile && <p className="text-xs text-emerald-600 font-semibold mt-2">New image selected</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2"><Building className="w-4 h-4 text-blue-500" /><span>Company Details</span></h3>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Company Name</label>
                <input type="text" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} className={FIELD_CLS} required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Company Website</label>
                <input type="url" placeholder="https://..." value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className={FIELD_CLS} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Location</label>
                <input type="text" placeholder="e.g. Mumbai, MH" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className={FIELD_CLS} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2"><UserIcon className="w-4 h-4 text-blue-500" /><span>Contact Details</span></h3>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Employer Name</label>
                <input type="text" defaultValue={user?.name} disabled className="w-full mt-1 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Contact Email</label>
                <input type="email" defaultValue={user?.email} disabled className="w-full mt-1 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Phone Number</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+91 xxxxx xxxxx" className={FIELD_CLS} />
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2 border-t border-gray-100 pt-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Company Address</label>
                <input type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} placeholder="Full street address..." className={FIELD_CLS} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Company Description</label>
                <textarea rows={4} value={profileForm.companyDescription} onChange={e => setProfileForm({...profileForm, companyDescription: e.target.value})} placeholder="Describe your company..." className={FIELD_CLS}></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setIsEditingProfile(false); setLogoFile(null); setLogoPreview(null); }} className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 text-center">Cancel</button>
            <button type="submit" disabled={profileLoading} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Employer Profile</h2>
          <button onClick={() => setIsEditingProfile(true)} className="flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
            <Edit3 className="w-4 h-4" /><span>Edit Profile</span>
          </button>
        </div>
        
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl.startsWith('http') ? profile.logoUrl : `http://localhost:5000${profile.logoUrl}`} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Building className="w-10 h-10 text-blue-400" />
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-2xl font-black text-gray-900">{profile?.companyName || user?.name || 'Company Name'}</h3>
            <p className="text-sm text-gray-500 mt-1">{profile?.location || 'Location not set'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400" /> {user?.name}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" /> {profile?.location || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">Contact Information</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Website</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {profile?.website ? <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.website}</a> : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Company Address</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profile?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">About Company</h4>
            <div className="prose prose-sm text-gray-600">
              {profile?.companyDescription ? (
                <p className="whitespace-pre-wrap">{profile.companyDescription}</p>
              ) : (
                <p className="italic text-gray-400">No company description provided yet. Click 'Edit Profile' to add one.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPostJob = () => {
    const setField = (k: keyof typeof postForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setPostForm(prev => ({ ...prev, [k]: e.target.value }));

    const salaryInvalid = !!(
      postForm.minSalary && postForm.maxSalary &&
      Number(postForm.maxSalary) < Number(postForm.minSalary)
    );

    if (postSuccess) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Job Posted Successfully!</h3>
            <p className="text-sm text-gray-500 mt-1">Your job is under review and will go live once approved by the Admin.</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => { setPostSuccess(false); setPostForm(INITIAL_POST_FORM); }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Post Another Job
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
            >
              View My Jobs
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Post a New Job</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fields marked {REQ} are required</p>
          </div>
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full self-start sm:self-auto">
            Pending Admin Approval
          </span>
        </div>

        <form onSubmit={handleJobSubmit} className="p-5 sm:p-6 space-y-8">

          {/* Error banner */}
          {postError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{postError}</span>
            </div>
          )}

          {/* ─── Section 1: Basic Information ─────────────────────────── */}
          <section className="space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Basic Information
            </h3>

            <div>
              <label className={LABEL_CLS}>Job Title {REQ}</label>
              <input
                type="text"
                value={postForm.title}
                onChange={setField('title')}
                placeholder="e.g. Senior Frontend Developer"
                required maxLength={100}
                className={FIELD_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Job Description {REQ}</label>
              <textarea
                value={postForm.description}
                onChange={setField('description')}
                rows={5}
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                required
                className={FIELD_CLS}
              />
              <p className="text-[11px] text-gray-400 mt-1">{postForm.description.length} characters</p>
            </div>

            <div>
              <label className={LABEL_CLS}>Requirements</label>
              <textarea
                value={postForm.requirements}
                onChange={setField('requirements')}
                rows={4}
                placeholder="Enter job requirements, required skills, qualifications, experience, or candidate criteria..."
                className={FIELD_CLS}
              />
              <p className="text-[11px] text-gray-400 mt-1">Specify required skills, qualifications, or candidate requirements (separate items with line breaks or commas).</p>
            </div>
          </section>

          {/* ─── Section 2: Job Details ────────────────────────────────── */}
          <section className="space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Job Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={LABEL_CLS}>Category {REQ}</label>
                <select
                  value={postForm.categoryId}
                  onChange={setField('categoryId')}
                  required
                  className={FIELD_CLS}
                >
                  <option value="">Select a category...</option>
                  {categories.length > 0
                    ? categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                    : (
                      <>
                        <option value="it">Information Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="trades">Trades &amp; Technical</option>
                        <option value="logistics">Logistics &amp; Driver</option>
                        <option value="office">Office &amp; Professional</option>
                        <option value="education">Education</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail &amp; Sales</option>
                        <option value="other">Other</option>
                      </>
                    )
                  }
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Job Type {REQ}</label>
                <select
                  value={postForm.jobType}
                  onChange={setField('jobType')}
                  required
                  className={FIELD_CLS}
                >
                  <option value="">Select job type...</option>
                  {jobTypes.length > 0
                    ? jobTypes.map(jt => <option key={jt._id} value={jt.name}>{jt.name}</option>)
                    : (
                      <>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </>
                    )
                  }
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={LABEL_CLS}>Location {REQ}</label>
                <input
                  type="text"
                  value={postForm.location}
                  onChange={setField('location')}
                  placeholder="e.g. Mumbai, Maharashtra  or  Remote"
                  required
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* ─── Section 3: Compensation & Requirements ───────────────── */}
          <section className="space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Compensation &amp; Requirements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={LABEL_CLS}>Minimum Salary (Rs. / month)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none select-none">Rs.</span>
                  <input
                    type="number"
                    value={postForm.minSalary}
                    onChange={setField('minSalary')}
                    min="0"
                    placeholder="e.g. 15000"
                    className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Maximum Salary (Rs. / month)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none select-none">Rs.</span>
                  <input
                    type="number"
                    value={postForm.maxSalary}
                    onChange={setField('maxSalary')}
                    min={postForm.minSalary || '0'}
                    placeholder="e.g. 30000"
                    className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                {salaryInvalid && (
                  <p className="text-[11px] text-red-500 mt-1">Max salary must be greater than or equal to min salary</p>
                )}
              </div>

              <div>
                <label className={LABEL_CLS}>Experience Required {REQ}</label>
                <select
                  value={postForm.experience}
                  onChange={setField('experience')}
                  required
                  className={FIELD_CLS}
                >
                  <option value="Fresher">Fresher</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Number of Vacancies {REQ}</label>
                <input
                  type="number"
                  value={postForm.totalVacancies}
                  onChange={setField('totalVacancies')}
                  min="1" max="999"
                  placeholder="1"
                  required
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* ─── Section 4: Application Settings ─────────────────────── */}
          <section className="space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Application Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={LABEL_CLS}>Application Deadline</label>
                <input
                  type="date"
                  value={postForm.applicationDeadline}
                  onChange={setField('applicationDeadline')}
                  min={new Date().toISOString().split('T')[0]}
                  className={FIELD_CLS}
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave blank for rolling / open applications</p>
              </div>

              {(postForm.minSalary || postForm.maxSalary) && (
                <div className="flex items-end">
                  <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1">Salary Preview</p>
                    <p className="text-sm font-bold text-blue-700">
                      {postForm.minSalary && postForm.maxSalary
                        ? `Rs.${Number(postForm.minSalary).toLocaleString('en-IN')} - Rs.${Number(postForm.maxSalary).toLocaleString('en-IN')} / month`
                        : postForm.minSalary
                        ? `Rs.${Number(postForm.minSalary).toLocaleString('en-IN')}+ / month`
                        : `Up to Rs.${Number(postForm.maxSalary).toLocaleString('en-IN')} / month`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setPostForm(INITIAL_POST_FORM); setPostError(''); }}
              className="sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={postLoading || salaryInvalid}
              className="flex-1 sm:flex-none sm:ml-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {postLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {postLoading ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderJobs = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">My Jobs</h2>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button
          onClick={() => setActiveTab('post-job')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition-all w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {jobsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-28" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center">
          <Briefcase className="w-14 h-14 text-gray-200 mb-4" />
          <h3 className="text-base font-bold text-gray-800">No jobs posted yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">Start hiring by posting your first job.</p>
          <button onClick={() => setActiveTab('post-job')} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700">Post a Job</button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => {
            const badge = getStatusBadge(job);
            const count = applicantCounts[job._id] ?? '--';
            const isExpanded = expandedJobId === job._id;
            return (
              <div key={job._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base truncate">{job.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{job.location}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{job.jobType}</span>
                        {job.salaryRange && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{job.salaryRange}</span>}
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{formatDate(job.createdAt)}</span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="font-semibold text-blue-600">{count}</span>&nbsp;applicants
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0">
                      <button onClick={() => setJobViewModal(job)} title="View" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"><Eye className="w-3.5 h-3.5" /> View</button>
                      <button onClick={() => setJobToEdit({ ...job })} title="Edit" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                      <button onClick={() => handleViewApplicants(job)} title="View Applicants" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"><Users className="w-3.5 h-3.5" /> Applicants</button>
                      <button onClick={() => setJobToDelete(job)} title="Delete" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      <button onClick={() => setExpandedJobId(isExpanded ? null : job._id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
                      {job.description || <span className="italic text-gray-400">No description provided.</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      {jobViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              <button onClick={() => setJobViewModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xl font-black text-gray-900">{jobViewModal.title}</h4>
                <span className={`inline-flex mt-1.5 items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(jobViewModal).cls}`}>{getStatusBadge(jobViewModal).label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {([
                  ['Location', jobViewModal.location],
                  ['Job Type', jobViewModal.jobType],
                  ['Experience Required', typeof jobViewModal.experience === 'number' ? (jobViewModal.experience === 0 ? 'Fresher' : `${jobViewModal.experience} Years`) : (jobViewModal.experience || 'Fresher')],
                  ['Salary Range', jobViewModal.salaryRange || 'Not specified'],
                  ['Vacancies', String(jobViewModal.totalVacancies)],
                  ['Posted Date', formatDate(jobViewModal.createdAt)],
                  ['Applicants', String(applicantCounts[jobViewModal._id] ?? '--')],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                    <p className="font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              {jobViewModal.description && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{jobViewModal.description}</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setJobViewModal(null); handleViewApplicants(jobViewModal); }} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-colors">View Applicants</button>
              <button onClick={() => { setJobToEdit({ ...jobViewModal }); setJobViewModal(null); }} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors">Edit Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {jobToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Job</h3>
              <button onClick={() => setJobToEdit(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditJob} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Job Title</label>
                <input type="text" required value={jobToEdit.title} onChange={e => setJobToEdit({ ...jobToEdit, title: e.target.value })} className={FIELD_CLS} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Location</label>
                  <input type="text" required value={jobToEdit.location} onChange={e => setJobToEdit({ ...jobToEdit, location: e.target.value })} className={FIELD_CLS} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Job Type</label>
                  <select value={jobToEdit.jobType} onChange={e => setJobToEdit({ ...jobToEdit, jobType: e.target.value })} className={FIELD_CLS}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Salary Range</label>
                  <input type="text" value={jobToEdit.salaryRange || ''} onChange={e => setJobToEdit({ ...jobToEdit, salaryRange: e.target.value })} placeholder="e.g. Rs.15,000 - Rs.25,000" className={FIELD_CLS} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Experience Required</label>
                  <select
                    value={jobToEdit.experience ?? 'Fresher'}
                    onChange={e => setJobToEdit({ ...jobToEdit, experience: e.target.value })}
                    className={FIELD_CLS}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="4 Years">4 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Vacancies</label>
                  <input type="number" min="1" value={jobToEdit.totalVacancies} onChange={e => setJobToEdit({ ...jobToEdit, totalVacancies: Number(e.target.value) })} className={FIELD_CLS} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Description</label>
                <textarea rows={4} value={jobToEdit.description} onChange={e => setJobToEdit({ ...jobToEdit, description: e.target.value })} className={FIELD_CLS} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setJobToEdit(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Job?</h3>
                <p className="text-sm text-gray-500 mt-0.5"><strong>"{jobToDelete.title}"</strong> will be permanently deleted. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setJobToDelete(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl">Cancel</button>
              <button onClick={handleDeleteJob} disabled={deleteLoading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteLoading ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

const renderApplicants = () => {
    let displayList = selectedJobForApplicants 
      ? allApplicants.filter(a => a.jobId?._id === selectedJobForApplicants._id) 
      : allApplicants;

    if (searchApplicantQuery) {
      const q = searchApplicantQuery.toLowerCase();
      displayList = displayList.filter(a => 
        (a.applicantId?.name || '').toLowerCase().includes(q) || 
        (a.applicantId?.email || '').toLowerCase().includes(q)
      );
    }

    if (filterAppJob && !selectedJobForApplicants) {
      displayList = displayList.filter(a => a.jobId?._id === filterAppJob);
    }
    if (filterAppStatus) {
      displayList = displayList.filter(a => a.status === filterAppStatus);
    }

    const tot = allApplicants.length;
    const pending = allApplicants.filter(a => ['Applied', 'Pending', 'Under Review'].includes(a.status)).length;
    const shortlisted = allApplicants.filter(a => ['Shortlisted', 'Interview Scheduled'].includes(a.status)).length;
    const selected = allApplicants.filter(a => ['Selected', 'Accepted'].includes(a.status)).length;
    const rejected = allApplicants.filter(a => a.status === 'Rejected').length;

    const uniqueJobs = Array.from(new Set(allApplicants.map(a => a.jobId?._id))).map(id => {
      const app = allApplicants.find(a => a.jobId?._id === id);
      return { _id: id, title: app?.jobId?.title };
    }).filter(j => j._id);

    const getAppStatusColor = (st: string) => {
      if (['Selected', 'Accepted'].includes(st)) return 'bg-emerald-100 text-emerald-700';
      if (['Rejected'].includes(st)) return 'bg-red-100 text-red-700';
      if (['Shortlisted', 'Interview Scheduled'].includes(st)) return 'bg-purple-100 text-purple-700';
      return 'bg-amber-100 text-amber-700';
    };

    const formatDate = (dateString: any) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {selectedJobForApplicants ? `Applicants for: ${selectedJobForApplicants.title}` : 'All Applicants'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage and review candidates</p>
          </div>
          {selectedJobForApplicants && (
            <button onClick={() => setSelectedJobForApplicants(null)} className="text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100">
              Clear Job Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">Total</p>
            <p className="text-2xl font-black text-gray-900">{tot}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
            <p className="text-xs font-bold text-amber-600 uppercase">New</p>
            <p className="text-2xl font-black text-amber-700">{pending}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm text-center">
            <p className="text-xs font-bold text-purple-600 uppercase">Shortlisted</p>
            <p className="text-2xl font-black text-purple-700">{shortlisted}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
            <p className="text-xs font-bold text-emerald-600 uppercase">Selected</p>
            <p className="text-2xl font-black text-emerald-700">{selected}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm text-center">
            <p className="text-xs font-bold text-red-600 uppercase">Rejected</p>
            <p className="text-2xl font-black text-red-700">{rejected}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={searchApplicantQuery} onChange={e => setSearchApplicantQuery(e.target.value)} className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          {!selectedJobForApplicants && (
            <select value={filterAppJob} onChange={e => setFilterAppJob(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none w-full sm:w-48">
              <option value="">All Jobs</option>
              {uniqueJobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
          )}
          <select value={filterAppStatus} onChange={e => setFilterAppStatus(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none w-full sm:w-48">
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {applicantsLoading ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p>Loading applicants...</p>
            </div>
          
          ) : applicantsError ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-12 h-12 mb-3 opacity-50" />
              <h3 className="text-base font-bold">Failed to load</h3>
              <p className="text-sm mt-1">{applicantsError}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100">Retry</button>
            </div>
          ) : displayList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No applicants found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Applicant</th>
                    <th className="p-4 font-bold">Job Title</th>
                    <th className="p-4 font-bold">Experience</th>
                    <th className="p-4 font-bold">Applied Date</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {displayList.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{app.applicantId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{app.applicantId?.email}</p>
                        <p className="text-xs text-gray-500">{app.applicantId?.phone}</p>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{app.jobId?.title || 'Unknown Job'}</td>
                      <td className="p-4 text-gray-600">{app.applicantId?.experience || 'Not specified'}</td>
                      <td className="p-4 text-gray-600">{formatDate(app.createdAt)}</td>
                      <td className="p-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-full border-none outline-none appearance-none cursor-pointer ${getAppStatusColor(app.status)}`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => setApplicantViewModal(app)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.applicantId?.resumeUrl ? (
                          <>
                            <a href={app.applicantId.resumeUrl.startsWith('http') ? app.applicantId.resumeUrl : `http://localhost:5000${app.applicantId.resumeUrl}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg inline-flex" title="View Resume">
                              <FileText className="w-4 h-4" />
                            </a>
                            <button onClick={() => handleDownloadResume(app.applicantId.resumeUrl, app.applicantId.name)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex" title="Download Resume">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">No Resume</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {applicantViewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="text-lg font-bold text-gray-900">Applicant Details</h3>
                <button onClick={() => setApplicantViewModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-gray-900">{applicantViewModal.applicantId?.name}</h4>
                    <p className="text-blue-600 font-semibold">{applicantViewModal.jobId?.title}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Applied: {formatDate(applicantViewModal.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Application Status</span>
                    <select
                      value={applicantViewModal.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setApplicantViewModal({ ...applicantViewModal, status: newStatus });
                        handleUpdateAppStatus(applicantViewModal._id, newStatus);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border border-transparent outline-none cursor-pointer transition-all ${getAppStatusColor(applicantViewModal.status)}`}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{applicantViewModal.applicantId?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Phone</p>
                    <p className="font-semibold text-gray-800">{applicantViewModal.applicantId?.phone || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{applicantViewModal.applicantId?.location || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Experience</p>
                    <p className="font-semibold text-gray-800">{applicantViewModal.applicantId?.experience || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Education</p>
                    <p className="font-semibold text-gray-800">{applicantViewModal.applicantId?.education || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {applicantViewModal.applicantId?.skills?.length ? (
                        applicantViewModal.applicantId.skills.map((sk: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-semibold">{sk}</span>
                        ))
                      ) : 'No skills specified'}
                    </div>
                  </div>
                </div>

                {applicantViewModal.coverLetter && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Cover Letter</p>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                      {applicantViewModal.coverLetter}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100 flex gap-3 items-center">
                  {applicantViewModal.applicantId?.resumeUrl ? (
                    <>
                      <a href={applicantViewModal.applicantId.resumeUrl.startsWith('http') ? applicantViewModal.applicantId.resumeUrl : `http://localhost:5000${applicantViewModal.applicantId.resumeUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                        <FileText className="w-4 h-4" /> View Resume
                      </a>
                      <button onClick={() => handleDownloadResume(applicantViewModal.applicantId.resumeUrl, applicantViewModal.applicantId.name)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" /> Download Resume
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm italic py-2">
                      <FileText className="w-4 h-4 opacity-50" /> No resume file was uploaded by this applicant.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

const navItems: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'post-job', label: 'Post a Job', icon: PlusCircle },
    { id: 'profile', label: 'Employer Profile', icon: Building },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{profile?.companyName || user?.name || 'Employer'}</h3>
            <span className="text-xs text-blue-600 font-semibold capitalize">{user?.role || 'Member'}</span>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 rounded-lg text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className={`lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="hidden lg:flex items-center space-x-3 pb-6 border-b border-gray-100 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{profile?.companyName || user?.name || 'Employer'}</h3>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold tracking-wider bg-blue-50 text-blue-700 rounded uppercase">
                {user?.role || 'Member'}
              </span>
            </div>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'jobs' && renderJobs()}
          {activeTab === 'post-job' && renderPostJob()}
          {activeTab === 'applicants' && renderApplicants()}
        </main>
      </div>
    </div>
  );
};
