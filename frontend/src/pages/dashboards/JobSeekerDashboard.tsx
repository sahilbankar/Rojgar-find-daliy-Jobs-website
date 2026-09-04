import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  User as UserIcon, 
  Briefcase, 
  Edit3, 
  X, 
  Menu, 
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  Eye,
  Loader2,
  ArrowRight,
  Building,
  Calendar,
  AlertTriangle,
  Camera,
  UploadCloud,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { applicationsAPI } from '../../services/applications';
import { usersAPI } from '../../services/users';

type Tab = 'overview' | 'profile' | 'applications' | 'saved-jobs';

export const JobSeekerDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real backend application state
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Saved Jobs State
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isSavedJobsLoading, setIsSavedJobsLoading] = useState(false);

  // My Applications Search & Filter State
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState('');
  const [avatarErrorMsg, setAvatarErrorMsg] = useState('');

  // Resume Upload State
  const [uploadingResumeProfile, setUploadingResumeProfile] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');
  const [resumeErrorMsg, setResumeErrorMsg] = useState('');

  const handleProfileResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      setResumeErrorMsg('Please upload a PDF or Word document (PDF, DOC, DOCX).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeErrorMsg('Resume file size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResumeProfile(true);
      setResumeErrorMsg('');
      setResumeSuccessMsg('');
      const res = await usersAPI.uploadResume(formData);
      if (res.data) {
        updateUser(res.data);
        setResumeSuccessMsg('Resume uploaded successfully!');
      }
    } catch (err: any) {
      
      setResumeErrorMsg(err?.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResumeProfile(false);
    }
  };

  // Profile Form State
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    phone: (user as any)?.phone || '', 
    location: (user as any)?.location || '', 
    skills: Array.isArray((user as any)?.skills) ? (user as any)?.skills.join(', ') : (user as any)?.skills || '', 
    experience: (user as any)?.experience || '', 
    education: (user as any)?.education || '',
    availabilityStatus: (user as any)?.availabilityStatus || 'Actively Looking' 
  });

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await applicationsAPI.getMyApplications();
      setApplications(res.data || []);
    } catch (err: any) {
      
      setError(err?.response?.data?.message || 'Failed to load applications from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await usersAPI.getProfile();
      if (res.data) {
        updateUser(res.data);
        setProfileData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : res.data.skills || '',
          experience: res.data.experience || '',
          education: res.data.education || '',
          availabilityStatus: res.data.availabilityStatus || 'Actively Looking'
        });
      }
    } catch (err: any) { void err; }
  };

  const fetchSavedJobs = async () => {
    setIsSavedJobsLoading(true);
    try {
      const res = await usersAPI.getSavedJobs();
      setSavedJobs(res.data || []);
    } catch (err: any) { void err; } finally {
      setIsSavedJobsLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
      await usersAPI.removeSavedJob(jobId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error removing job');
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchUserProfile();
    fetchSavedJobs();
  }, []);

  const getAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverOrigin = baseApi.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${serverOrigin}${cleanPath}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setAvatarErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarErrorMsg('Image size should be less than 2MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      setAvatarErrorMsg('');
      setAvatarSuccessMsg('');
      const res = await usersAPI.uploadAvatar(formData);
      const updatedUser = res.data || res.user || res;
      if (updatedUser) {
        updateUser(updatedUser);
        setAvatarSuccessMsg('Profile image uploaded successfully!');
        setTimeout(() => setAvatarSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      
      setAvatarErrorMsg(err?.response?.data?.message || 'Failed to upload profile image.');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedSkills = typeof profileData.skills === 'string' 
        ? profileData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : profileData.skills;

      const res = await usersAPI.updateProfile({
        ...profileData,
        skills: formattedSkills
      });

      if (res.data) {
        updateUser(res.data);
      }
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  // Real data calculations
  const totalApps = applications.length;
  const appliedApps = applications.filter(a => ['Applied', 'Pending'].includes(a.status)).length;
  const underReviewApps = applications.filter(a => ['Under Review', 'Reviewed'].includes(a.status)).length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewScheduledApps = applications.filter(a => ['Interview Scheduled', 'Interviewing'].includes(a.status)).length;
  const selectedApps = applications.filter(a => ['Selected', 'Accepted'].includes(a.status)).length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;
  const savedJobsCount = (user as any)?.savedJobs?.length || 0;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Selected':
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Shortlisted':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Interview Scheduled':
      case 'Interviewing':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Under Review':
      case 'Reviewed':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Welcome back, {user?.name || 'Candidate'}! 👋
            </h2>
            <p className="text-sm text-gray-500">Loading your real-time jobseeker statistics...</p>
          </div>
          <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Fetching live applications data from backend...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Welcome back, {user?.name || 'Candidate'}! 👋
            </h2>
            <p className="text-sm text-gray-500">Track your job applications and profile activity.</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Error Loading Overview</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchApplications}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Request</span>
            </button>
          </div>
        </div>
      );
    }

    const metricCards = [
      { label: 'Total Applications', count: totalApps, icon: FileText, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', valText: 'text-blue-950', iconBg: 'bg-blue-600' },
      { label: 'Applied Applications', count: appliedApps, icon: Clock, bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-600', valText: 'text-sky-950', iconBg: 'bg-sky-600' },
      { label: 'Under Review', count: underReviewApps, icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', valText: 'text-amber-950', iconBg: 'bg-amber-500' },
      { label: 'Shortlisted', count: shortlistedApps, icon: CheckCircle2, bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', valText: 'text-purple-950', iconBg: 'bg-purple-600' },
      { label: 'Interview Scheduled', count: interviewScheduledApps, icon: Calendar, bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', valText: 'text-indigo-950', iconBg: 'bg-indigo-600' },
      { label: 'Selected', count: selectedApps, icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', valText: 'text-emerald-950', iconBg: 'bg-emerald-600' },
      { label: 'Rejected', count: rejectedApps, icon: X, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', valText: 'text-rose-950', iconBg: 'bg-rose-600' },
      { label: 'Saved Jobs', count: savedJobsCount, icon: Bookmark, bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-600', valText: 'text-teal-950', iconBg: 'bg-teal-600' },
    ];

    const recentApplications = applications.slice(0, 5);

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            Welcome back, {user?.name || 'Candidate'}! 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">Real-time status of all your submitted job applications.</p>
        </div>

        {/* 8 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div key={idx} className={`p-4 ${card.bg} border ${card.border} rounded-2xl flex items-center space-x-4 shadow-sm transition-transform hover:-translate-y-0.5`}>
                <div className={`p-3 ${card.iconBg} text-white rounded-xl shadow-xs`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs ${card.text} font-bold uppercase tracking-wider`}>{card.label}</p>
                  <p className={`text-2xl font-black ${card.valText} mt-0.5`}>{card.count}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Applications / Empty State Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your latest submissions</p>
            </div>
            {totalApps > 0 && (
              <button 
                onClick={() => setActiveTab('applications')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View All ({totalApps})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {totalApps === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h4 className="text-lg font-bold text-gray-900">No applications submitted yet</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  You haven't applied to any job openings yet. Explore thousands of active listings and start applying today!
                </p>
              </div>
              <Link
                to="/jobs"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explore Open Jobs</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Job & Company</th>
                    <th className="p-4 font-bold">Location / Type</th>
                    <th className="p-4 font-bold">Applied Date</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recentApplications.map((app: any) => {
                    const jobTitle = app.jobId?.title || 'Job Listing';
                    const company = app.jobId?.employerId?.companyName || app.jobId?.companyName || 'Company';
                    const location = app.jobId?.location || 'Remote/Unspecified';
                    const jobType = app.jobId?.jobType || 'Full-Time';

                    return (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{jobTitle}</p>
                          <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span>{company}</span>
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-700 text-xs font-semibold">{location}</p>
                          <span className="inline-block mt-0.5 text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                            {jobType}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-600">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl transition-colors inline-flex items-center space-x-1 text-xs font-bold"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderApplications = () => {
    let filteredApps = applications;

    if (appSearchQuery) {
      const q = appSearchQuery.toLowerCase();
      filteredApps = filteredApps.filter((app: any) => {
        const title = (app.jobId?.title || '').toLowerCase();
        const company = (app.jobId?.employerId?.companyName || app.jobId?.companyName || '').toLowerCase();
        return title.includes(q) || company.includes(q);
      });
    }

    if (appStatusFilter && appStatusFilter !== 'All') {
      filteredApps = filteredApps.filter((app: any) => app.status === appStatusFilter);
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Applications</h2>
            <p className="text-sm text-gray-500 mt-0.5">Track real-time employer status updates for your submitted applications.</p>
          </div>
          <button 
            onClick={fetchApplications}
            className="self-start sm:self-auto p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-xs transition-colors flex items-center space-x-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Fetch Latest Status</span>
          </button>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search applications by Job Title or Company..." 
              value={appSearchQuery} 
              onChange={e => setAppSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
            <select 
              value={appStatusFilter} 
              onChange={e => setAppStatusFilter(e.target.value)} 
              className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none w-full sm:w-52 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses ({applications.length})</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Loading State */}
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-gray-500">Loading your live application records...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-8 bg-red-50 text-center flex flex-col items-center justify-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-bold text-red-800">{error}</p>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredApps.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="w-12 h-12 text-gray-300" />
              <h3 className="text-base font-bold text-gray-800">
                {applications.length === 0 ? 'No applications submitted yet' : 'No applications match your filter'}
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                {applications.length === 0 
                  ? "You haven't applied to any job listings yet. Start exploring active opportunities!"
                  : "Try clearing your search query or status filter to view all applications."}
              </p>
              {applications.length === 0 ? (
                <Link
                  to="/jobs"
                  className="mt-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all"
                >
                  Browse Available Jobs
                </Link>
              ) : (
                <button
                  onClick={() => { setAppSearchQuery(''); setAppStatusFilter('All'); }}
                  className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Success Data State - Applications Table */
            <div className="divide-y divide-gray-100">
              {filteredApps.map((app: any) => {
                const jobTitle = app.jobId?.title || 'Job Listing';
                const company = app.jobId?.employerId?.companyName || app.jobId?.companyName || 'Company';

                return (
                  <div key={app._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-base">{jobTitle}</h4>
                      <p className="text-xs text-gray-500 flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{company}</span>
                        </span>
                        <span>•</span>
                        <span>Applied on {formatDate(app.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 justify-between sm:justify-end">
                      {/* Read-only Status Badge */}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const avatarSrc = getAvatarUrl((user as any)?.avatarUrl || (user as any)?.avatar);

    if (isEditingProfile) {
      return (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <button type="button" onClick={() => setIsEditingProfile(false)} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Picture Upload Section */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Profile Photo</span>
            </h3>

            {avatarSuccessMsg && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {avatarSuccessMsg}
              </p>
            )}
            {avatarErrorMsg && (
              <p className="text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {avatarErrorMsg}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                {avatarSrc ? (
                  <img 
                    key={avatarSrc}
                    src={avatarSrc} 
                    alt={user?.name || 'Profile Avatar'} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold border-2 border-blue-300 shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{uploadingAvatar ? 'Uploading...' : 'Choose Image File'}</span>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                    disabled={uploadingAvatar}
                  />
                </label>
                <p className="text-[11px] text-gray-500">Allowed formats: JPG, PNG, WEBP (Max 2MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <span>Basic Details</span>
              </h3>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Email</label>
                <input type="email" value={user?.email || ''} disabled className="w-full mt-1 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Phone</label>
                <input 
                  type="tel" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Location</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="City, State" 
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>Professional Details</span>
              </h3>
              
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Skills</label>
                <input 
                  type="text" 
                  value={profileData.skills}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  placeholder="e.g. React, Node.js (comma separated)" 
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Education / Qualification</label>
                <input 
                  type="text" 
                  value={profileData.education}
                  onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                  placeholder="e.g. B.Tech in Computer Science" 
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Experience</label>
                <input 
                  type="text" 
                  value={profileData.experience}
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  placeholder="e.g. 3 years" 
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Availability</label>
                <select 
                  value={profileData.availabilityStatus}
                  onChange={(e) => setProfileData({ ...profileData, availabilityStatus: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Actively Looking">Actively Looking</option>
                  <option value="Not Looking">Not Looking</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 text-center">
              Cancel
            </button>
            <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">
              Save Changes
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
          {/* Avatar Container with Upload Badge */}
          <div className="relative group">
            {avatarSrc ? (
              <img 
                key={avatarSrc}
                src={avatarSrc} 
                alt={user?.name || 'Profile Avatar'} 
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md ring-4 ring-blue-50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-black border-4 border-white shadow-md ring-4 ring-blue-50">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            
            <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg cursor-pointer transition-all hover:scale-105" title="Change Profile Picture">
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              <input 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,image/webp" 
                onChange={handleAvatarUpload} 
                className="hidden" 
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          {avatarSuccessMsg && (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {avatarSuccessMsg}
            </p>
          )}
          {avatarErrorMsg && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
              {avatarErrorMsg}
            </p>
          )}

          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
              {(user as any)?.availabilityStatus || 'Actively Looking'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pt-6 border-t border-gray-100 w-full max-w-lg">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Phone</span>
              <span className="font-semibold text-gray-800">{(user as any)?.phone || 'Not set'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Location</span>
              <span className="font-semibold text-gray-800">{(user as any)?.location || 'Not set'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Education</span>
              <span className="font-semibold text-gray-800">{(user as any)?.education || 'Not set'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Experience</span>
              <span className="font-semibold text-gray-800">{(user as any)?.experience || 'Not set'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase block">Skills</span>
              <span className="font-semibold text-gray-800">
                {Array.isArray((user as any)?.skills) && (user as any)?.skills.length > 0 
                  ? (user as any)?.skills.join(', ') 
                  : 'Not set'}
              </span>
            </div>
          </div>

          {/* Resume Management Section */}
          <div className="p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-3 w-full max-w-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Resume Document</span>
              </span>
              {(user as any)?.resumeUrl && (
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Uploaded & Active
                </span>
              )}
            </div>

            {resumeSuccessMsg && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {resumeSuccessMsg}
              </p>
            )}
            {resumeErrorMsg && (
              <p className="text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {resumeErrorMsg}
              </p>
            )}

            {(user as any)?.resumeUrl ? (
              <div className="flex items-center justify-between p-3.5 bg-white border border-blue-200 rounded-xl shadow-2xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {(user as any).resumeUrl.split('/').pop()}
                  </span>
                </div>
                <a 
                  href={getAvatarUrl((user as any).resumeUrl) || '#'} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 ml-2 shadow-2xs"
                >
                  View Resume
                </a>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No resume file uploaded yet. Upload one below to use when applying for jobs.</p>
            )}

            <label className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl cursor-pointer transition-all border border-blue-200 shadow-2xs hover:border-blue-300">
              {uploadingResumeProfile ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <UploadCloud className="w-4 h-4 text-blue-600" />}
              <span>{uploadingResumeProfile ? 'Uploading Resume...' : ((user as any)?.resumeUrl ? 'Replace / Update Resume' : 'Upload Resume File')}</span>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleProfileResumeUpload} 
                className="hidden" 
                disabled={uploadingResumeProfile}
              />
            </label>
            <p className="text-[11px] text-gray-500 text-center">Supports PDF, DOC, DOCX files up to 5MB.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSavedJobs = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Saved Jobs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Bookmarked job listings saved to your candidate account.</p>
        </div>
        <button 
          onClick={fetchSavedJobs}
          className="self-start sm:self-auto p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 shadow-2xs transition-colors flex items-center space-x-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        {isSavedJobsLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Loading your saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Bookmark className="w-12 h-12 text-gray-300" />
            <h3 className="text-base font-bold text-gray-800">No saved jobs found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              You haven't bookmarked any jobs yet. Browse available jobs and click the Bookmark icon to save them here!
            </p>
            <Link
              to="/jobs"
              className="mt-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all"
            >
              Browse Open Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((job: any) => {
              const companyName = job.companyName || job.employerId?.companyName || 'Company';
              const categoryName = job.category || job.categoryId?.name || 'General';

              return (
                <div key={job._id} className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 hover:border-blue-300 shadow-2xs transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-extrabold rounded-md">
                        {categoryName}
                      </span>
                      <button
                        onClick={() => handleRemoveSavedJob(job._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center space-x-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
                        title="Remove from Saved"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-base">{job.title}</h4>
                    <p className="text-xs font-semibold text-gray-600 flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span>{companyName}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">
                      {job.salaryMin > 0 ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / mo` : 'Competitive Salary'}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                    >
                      <span>View Job</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const sidebarAvatar = getAvatarUrl((user as any)?.avatarUrl || (user as any)?.avatar);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-3">
          {sidebarAvatar ? (
            <img 
              key={sidebarAvatar}
              src={sidebarAvatar} 
              alt={user?.name || 'User'} 
              className="w-10 h-10 rounded-xl object-cover border border-blue-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{user?.name || 'User'}</h3>
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
            {sidebarAvatar ? (
              <img 
                key={sidebarAvatar}
                src={sidebarAvatar} 
                alt={user?.name || 'User'} 
                className="w-12 h-12 rounded-xl object-cover border border-blue-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{user?.name || 'User'}</h3>
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
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'saved-jobs' && renderSavedJobs()}
          {activeTab === 'profile' && renderProfile()}
        </main>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-200 rounded-xl text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedApp.jobId?.title || 'Job Listing'}</h4>
                  <p className="text-sm font-semibold text-blue-600 mt-0.5">
                    {selectedApp.jobId?.employerId?.companyName || selectedApp.jobId?.companyName || 'Company'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 font-bold block uppercase">Applied On</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">{formatDate(selectedApp.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block uppercase">Location</span>
                  <span className="text-gray-800 font-semibold mt-0.5 block">{selectedApp.jobId?.location || 'N/A'}</span>
                </div>
                {selectedApp.jobId?.salaryMin !== undefined && (
                  <div className="col-span-2 pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 font-bold block uppercase">Salary Range</span>
                    <span className="text-gray-800 font-semibold mt-0.5 block">
                      ₹{selectedApp.jobId?.salaryMin?.toLocaleString()} - ₹{selectedApp.jobId?.salaryMax?.toLocaleString()} / month
                    </span>
                  </div>
                )}
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Cover Letter</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
