import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  Building, 
  AlertCircle,
  Clock,
  Briefcase,
  Tag,
  CheckCircle,
  X,
  Loader2,
  UploadCloud,
  FileText,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Job } from '../types';
import { jobsAPI } from '../services/jobs.service';
import { applicationsAPI } from '../services/applications.service';
import { usersAPI } from '../services/users.service';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
    const { isAuthenticated, user, updateUser } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Form States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [experience, setExperience] = useState((user as any)?.experience || '');
  const [resumeUrl, setResumeUrl] = useState((user as any)?.resumeUrl || '');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadMsg, setResumeUploadMsg] = useState('');
  
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        
        if (!id) {
          setError('Job ID is missing in the request.');
          setIsLoading(false);
          return;
        }

        const res = await Promise.race([
          jobsAPI.getJobById(id),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Job details request timed out after 10 seconds.')), 10000))
        ]);
        const fetchedJob = res.data || res;
        if (!fetchedJob || !fetchedJob._id) {
          setError('The requested job listing was not found or has been removed.');
        } else {
          setJob(fetchedJob);
        }
      } catch (err: any) {
        console.error('Fetch job details error:', err);
        setError(err?.response?.data?.message || 'Failed to fetch job details. The job may have been removed or deleted.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!fullName && (user as any)?.name) setFullName((user as any).name);
      if (!email && (user as any)?.email) setEmail((user as any).email);
      if (!phone && (user as any)?.phone) setPhone((user as any).phone);
      if (!location && (user as any)?.location) setLocation((user as any).location);
      if (!experience && (user as any)?.experience) setExperience((user as any).experience);
      if (!resumeUrl && (user as any)?.resumeUrl) setResumeUrl((user as any).resumeUrl);

      if (user.role === 'jobseeker' && id) {
        applicationsAPI.getMyApplications()
          .then(res => {
            const myApps = res.data || [];
            const hasApplied = myApps.some((app: any) => 
              (app.jobId?._id && app.jobId._id === id) || (app.jobId === id)
            );
            if (hasApplied) {
              setApplySuccess(true);
            }
          })
          .catch(err => console.error('Check user applications error:', err));
      }
    }
  }, [user, id]);

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      setApplyError('Please upload a PDF or Word document (PDF, DOC, DOCX).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setApplyError('Resume file size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      setApplyError('');
      setResumeUploadMsg('');
      const res = await usersAPI.uploadResume(formData);
      if (res.data?.resumeUrl) {
        setResumeUrl(res.data.resumeUrl);
        updateUser(res.data);
        setResumeUploadMsg('New resume uploaded successfully!');
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setApplyError(err?.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;

    if (!fullName.trim()) return setApplyError('Full Name is required.');
    
    if (!email.trim()) return setApplyError('Email Address is required.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setApplyError('Please enter a valid Email Address.');
    
    if (!phone.trim()) return setApplyError('Phone Number is required.');
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) return setApplyError('Please enter a valid Phone Number.');
    
    if (!location.trim()) return setApplyError('Current Location is required.');
    if (!keySkills.trim()) return setApplyError('Key Skills are required.');
    if (!coverLetter.trim()) return setApplyError('Cover Letter / Application Message is required.');

    const finalResume = resumeUrl || (user as any)?.resumeUrl;
    if (!finalResume) {
      setApplyError('Please upload or select a resume before submitting your application.');
      return;
    }

    try {
      setApplyLoading(true);
      setApplyError('');
      
      const payload = {
        fullName,
        email,
        phone,
        location,
        keySkills,
        jobTitle,
        portfolio,
        coverLetter, 
        experience, 
        resumeUrl: finalResume 
      };
      
      const response = await applicationsAPI.applyForJob(job._id, payload);

      if (response.success || response.data) {
        setApplySuccess(true);
        setShowApplyModal(false);
        // Automatically decrease remaining vacancy count in local state
        setJob((prev: any) => {
          if (!prev) return prev;
          const currentRemaining = prev.remainingVacancies !== undefined ? prev.remainingVacancies : prev.totalVacancies;
          return {
            ...prev,
            remainingVacancies: Math.max(0, currentRemaining - 1)
          };
        });
      }
    } catch (err: any) {
      console.error('Submit application error:', err);
      setApplyError(err?.response?.data?.message || 'Failed to submit application. You might have already applied for this job.');
    } finally {
      setApplyLoading(false);
    }
  };

  const formatSalary = (j: Job) => {
    if (j.salaryMin !== undefined && j.salaryMax !== undefined && (j.salaryMin > 0 || j.salaryMax > 0)) {
      return `₹${j.salaryMin.toLocaleString()} - ₹${j.salaryMax.toLocaleString()} / month`;
    }
    if (j.salaryRange) {
      return j.salaryRange.startsWith('₹') ? j.salaryRange : `₹${j.salaryRange}`;
    }
    return 'Salary Not Disclosed';
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Open until filled';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFullFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-semibold text-sm">Loading job details from backend...</p>
      </div>
    );
  }

  // Handle Invalid or Deleted Job IDs
  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-red-50 rounded-full text-red-500 border border-red-100">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-black text-gray-900">Job Not Found</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {error || 'The job ID specified in the URL is invalid or this job has been removed by the employer.'}
          </p>
        </div>
        <Link 
          to="/jobs" 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>
    );
  }

  const companyName = job.companyName || job.employerId?.companyName || 'Company';
  const categoryName = job.category || job.categoryId?.name || 'General';
  const experienceRequired = job.experienceYears !== undefined ? job.experienceYears : (job.experience || 0);
  const totalVacancies = job.totalVacancies || job.vacancies || 1;
  const remainingVacancies = job.remainingVacancies !== undefined ? job.remainingVacancies : totalVacancies;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Navigation */}
      <Link to="/jobs" className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Listings</span>
      </Link>

      {/* Main Job Card Container */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-8">
        
        {/* Header: Title, Badges & Company */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-5">
            {job?.employerId?.logoUrl ? (
              <img 
                src={job.employerId.logoUrl.startsWith('http') ? job.employerId.logoUrl : `http://localhost:5000${job.employerId.logoUrl}`} 
                alt={`${companyName} logo`} 
                className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0 bg-white shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                  <Tag className="w-3 h-3" />
                  <span>{categoryName}</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                  <Briefcase className="w-3 h-3" />
                  <span>{job?.jobType || 'Full-time'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {job?.title || "Job Title"}
              </h1>

              <div className="flex flex-col space-y-1 mt-1">
                <Link 
                  to={`/employers/${job.employerId?._id || job.employerId}`}
                  className="text-base font-semibold text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-2 w-fit group"
                >
                  <Building className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  <span>{companyName}</span>
                </Link>
                {(job as any).employerName && (
                  <p className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>Posted by: {(job as any).employerName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="sm:text-right bg-blue-50/60 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Package</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{formatSalary(job)}</p>
          </div>
        </div>

        {/* Quick Details Pills (All 12 Required Fields Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50/80 rounded-2xl text-xs">
          <div className="space-y-0.5">
            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Location</span>
            <span className="text-gray-900 font-bold flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{job?.location || "Location Not Specified"}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Experience Required</span>
            <span className="text-gray-900 font-bold flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{typeof experienceRequired === 'number' ? (experienceRequired === 0 ? 'Fresher' : `${experienceRequired}+ Years`) : experienceRequired}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Vacancies</span>
            <span className="text-gray-900 font-bold flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>{remainingVacancies} Remaining / {totalVacancies} Total</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Deadline</span>
            <span className="text-gray-900 font-bold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{formatDate(job.applicationDeadline)}</span>
            </span>
          </div>
        </div>

        {/* Posted Date */}
        <div className="text-xs text-gray-500 flex items-center space-x-2 pt-1 border-b border-gray-100 pb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span><strong>Posted Date:</strong> {formatDate(job.createdAt)}</span>
        </div>

        {/* Job Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
            Job Description
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job?.description || "No description provided."}
          </p>
        </div>

        {/* Requirements */}
        {Array.isArray((job as any).requirements) && (job as any).requirements.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">
              Key Requirements
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {(job as any).requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Apply CTA Section */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-800">Ready to submit your application?</p>
            <p className="text-xs text-gray-500 mt-0.5">Saves directly to database with live status tracking.</p>
          </div>

          {isAuthenticated ? (
            user?.role === 'jobseeker' ? (
              <>
                {applySuccess ? (
                  <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Application Saved to Database!</span>
                  </div>
                ) : remainingVacancies <= 0 ? (
                  <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-6 py-3 rounded-xl border border-red-200 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>No Vacancies Remaining</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowApplyModal(true)} 
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                  >
                    Apply Now
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
                Only logged-in Job Seekers can submit applications.
              </div>
            )
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all text-center"
            >
              Login to Apply
            </Link>
          )}
        </div>
      </div>

      {/* Comprehensive Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Application Form</h3>
                <p className="text-xs text-gray-500">{job?.title || "Job Title"} • {companyName}</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)} 
                className="p-2 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitApplication} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {applyError && (
                <div className="p-3.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{applyError}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 4. Current Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Current Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 5. Key Skills */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Key Skills <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={keySkills}
                  onChange={(e) => setKeySkills(e.target.value)}
                  placeholder="e.g. React, Node.js, UI/UX"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 6. Relevant Experience (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                  <span>Relevant Experience</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Optional</span>
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3 years in Frontend Engineering or Fresher"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              {/* 7. Current / Previous Job Title (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                  <span>Current / Previous Job Title</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Optional</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 8. Portfolio / Professional Profile Link (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                  <span>Portfolio / Professional Profile Link</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Optional</span>
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://linkedin.com/in/username or Github/Portfolio"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* 9. Cover Letter / Application Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Cover Letter / Application Message <span className="text-red-500">*</span></label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, highlight your skills, and explain why you're a great fit..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-28 resize-none"
                />
              </div>

              {/* 10. Resume Upload & Selection */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase block">Resume Attachment <span className="text-red-500">*</span></label>

                {resumeUploadMsg && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    {resumeUploadMsg}
                  </p>
                )}

                {resumeUrl ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-blue-900 truncate">
                        {resumeUrl.split('/').pop() || 'Resume Document'}
                      </span>
                    </div>
                    <a
                      href={getFullFileUrl(resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline shrink-0 ml-2"
                    >
                      View
                    </a>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <label className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-gray-200">
                    {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <UploadCloud className="w-4 h-4 text-blue-600" />}
                    <span>{uploadingResume ? 'Uploading Resume...' : (resumeUrl ? 'Change Resume File' : 'Upload Resume File')}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                      disabled={uploadingResume}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400">PDF, DOC, DOCX up to 5MB.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)} 
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={applyLoading || uploadingResume} 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors inline-flex justify-center items-center space-x-2 shadow-md"
                >
                  {applyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{applyLoading ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
