import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Users,
  MapPin, 
  Briefcase, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Building,
  Tag,
  DollarSign,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Bookmark,
  User as UserIcon
} from 'lucide-react';
import { Job, JobCategory } from '../types';
import { jobsAPI, GetJobsParams } from '../services/jobs.service';
import { usersAPI } from '../services/users.service';
import { useAuth } from '../hooks/useAuth';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [locationTerm, setLocationTerm] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedJobType, setSelectedJobType] = useState(searchParams.get('jobType') || 'All');
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get('experience') || 'All');
  const [selectedMinSalary, setSelectedMinSalary] = useState(searchParams.get('minSalary') || 'All');
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(10);
  
  // Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Fetch Saved Jobs for logged in Job Seeker
  useEffect(() => {
    if (isAuthenticated && user?.role === 'jobseeker') {
      usersAPI.getSavedJobs()
        .then(res => {
          const list = res.data || [];
          setSavedJobIds(list.map((j: any) => j._id));
        })
        .catch(err => console.error('Fetch saved jobs error:', err));
    }
  }, [isAuthenticated, user]);

  const toggleSaveJob = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== 'jobseeker') {
      alert('Please log in as a Job Seeker to save jobs.');
      return;
    }

    try {
      if (savedJobIds.includes(jobId)) {
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
        await usersAPI.removeSavedJob(jobId);
      } else {
        setSavedJobIds(prev => [...prev, jobId]);
        await usersAPI.saveJob(jobId);
      }
    } catch (err) {
      console.error('Toggle save job error:', err);
    }
  };

  // Fetch Category List for Dropdown Filter
  useEffect(() => {
    jobsAPI.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // Fetch Jobs when filters change
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update URL parameters
      const newParams = new URLSearchParams();
      if (searchTerm) newParams.set('q', searchTerm);
      if (locationTerm) newParams.set('location', locationTerm);
      if (selectedCategory && selectedCategory !== 'All') newParams.set('category', selectedCategory);
      if (selectedJobType && selectedJobType !== 'All') newParams.set('jobType', selectedJobType);
      if (selectedExperience && selectedExperience !== 'All') newParams.set('experience', selectedExperience);
      if (selectedMinSalary && selectedMinSalary !== 'All') newParams.set('minSalary', selectedMinSalary);
      if (page > 1) newParams.set('page', page.toString());
      setSearchParams(newParams, { replace: true });

      // Construct API payload
      const apiParams: GetJobsParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      
      if (searchTerm) apiParams.q = searchTerm;
      if (locationTerm) apiParams.location = locationTerm;
      if (selectedCategory !== 'All') apiParams.category = selectedCategory;
      if (selectedJobType !== 'All') apiParams.jobType = selectedJobType;
      if (selectedExperience !== 'All') apiParams.experience = selectedExperience;
      if (selectedMinSalary !== 'All') apiParams.minSalary = Number(selectedMinSalary);

      const response = await jobsAPI.getJobs(apiParams);
      
      const jobList = response.jobs || response.data || [];
      setJobs(jobList);
      setTotalJobs(response.total || jobList.length);
      setTotalPages(response.totalPages || Math.ceil((response.total || jobList.length) / limit) || 1);

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch jobs from backend API. Please try again.');
      console.error('Fetch jobs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, locationTerm, selectedCategory, selectedJobType, selectedExperience, selectedMinSalary, page, limit, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationTerm('');
    setSelectedCategory('All');
    setSelectedJobType('All');
    setSelectedExperience('All');
    setSelectedMinSalary('All');
    setPage(1);
  };

  const formatSalary = (job: Job) => {
    if (job.salaryMin !== undefined && job.salaryMax !== undefined && (job.salaryMin > 0 || job.salaryMax > 0)) {
      return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()} / month`;
    }
    if (job.salaryRange) {
      return job.salaryRange.startsWith('₹') ? job.salaryRange : `₹${job.salaryRange}`;
    }
    return 'Salary Not Disclosed';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">Browse Real Jobs</h1>
        <p className="text-blue-200 text-sm sm:text-base">
          Search live active job postings from employers and apply with one click.
        </p>

        {/* Global Search Bar (Job Title, Company Name, Location, Category) */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center space-x-3 px-4 py-3 bg-white rounded-2xl text-gray-900 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Company, Location, or Category..."
              className="w-full bg-transparent focus:outline-none text-sm font-medium"
            />
          </div>

          <div className="w-full md:w-64 flex items-center space-x-3 px-4 py-3 bg-white rounded-2xl text-gray-900 shadow-sm">
            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              placeholder="Filter Location..."
              className="w-full bg-transparent focus:outline-none text-sm font-medium"
            />
          </div>

          <button 
            type="submit" 
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all text-center shrink-0"
          >
            Search Jobs
          </button>
        </form>
      </div>

      {/* Main Container: Filters Sidebar + Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-gray-900 text-base">Filter Jobs</h2>
            </div>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={locationTerm}
              onChange={(e) => { setLocationTerm(e.target.value); setPage(1); }}
              placeholder="e.g. Mumbai, Remote"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Job Type Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Job Type
            </label>
            <select
              value={selectedJobType}
              onChange={(e) => { setSelectedJobType(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-Time</option>
              <option value="Part-time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
              <option value="Daily Wage">Daily Wage</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
              <option value="Trades & Technical">Trades & Technical</option>
              <option value="Logistics">Logistics & Driver</option>
              <option value="Office & Professional">Office & Professional</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          {/* Experience Required Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Experience Required
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => { setSelectedExperience(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="All">Any Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
              <option value="4 Years">4 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          {/* Salary Range Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Minimum Salary
            </label>
            <select
              value={selectedMinSalary}
              onChange={(e) => { setSelectedMinSalary(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="All">Any Salary</option>
              <option value="10000">₹10,000+ / month</option>
              <option value="25000">₹25,000+ / month</option>
              <option value="50000">₹50,000+ / month</option>
              <option value="100000">₹100,000+ / month</option>
            </select>
          </div>
          
          {/* Sorting */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Sort Listings
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => { 
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy); 
                setSortOrder(newSortOrder as 'asc'|'desc'); 
                setPage(1);
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="salaryMax-desc">Highest Salary</option>
            </select>
          </div>
        </aside>

        {/* Job Listings Column */}
        <main className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">
              {isLoading ? 'Searching live database...' : `Found ${totalJobs} Active Job${totalJobs === 1 ? '' : 's'}`}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3 text-sm">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-semibold text-sm">Loading active jobs from backend API...</p>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">No jobs match your search</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search keyword or clearing your filters to see more results.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Success Data State - Job Cards */
            <div className="space-y-4">
              {jobs.map((job) => {
                const companyName = job.companyName || job.employerId?.companyName || 'Company';
                const totalVacancies = job.totalVacancies || job.vacancies || 1;
                const remainingVacancies = job.remainingVacancies !== undefined ? job.remainingVacancies : totalVacancies;
                const categoryName = job.category || job.categoryId?.name || 'General';
                const experienceReq = job.experienceYears !== undefined ? job.experienceYears : (job.experience || 0);

                return (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all space-y-4 group"
                  >
                    {/* Header: Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {job.employerId?.logoUrl ? (
                          <img 
                            src={job.employerId.logoUrl.startsWith('http') ? job.employerId.logoUrl : `http://localhost:5000${job.employerId.logoUrl}`} 
                            alt={`${companyName} logo`} 
                            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0 bg-white shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Building className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{categoryName}</span>
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-md flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active Job</span>
                            </span>
                          </div>

                          <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h2>

                          <div className="flex flex-col space-y-1 mt-1">
                            <Link 
                              to={`/employers/${job.employerId?._id || job.employerId}`}
                              className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1.5 group w-fit"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Building className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                              <span>{companyName}</span>
                            </Link>
                            {(job as any).employerName && (
                              <p className="text-[11px] font-medium text-gray-500 flex items-center space-x-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                <span>Posted by: {(job as any).employerName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <button
                          onClick={(e) => toggleSaveJob(e, job._id)}
                          className={`p-2 rounded-xl border transition-all ${
                            savedJobIds.includes(job._id)
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'
                          }`}
                          title={savedJobIds.includes(job._id) ? 'Remove from Saved Jobs' : 'Save Job'}
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobIds.includes(job._id) ? 'fill-blue-600 text-blue-600' : ''}`} />
                        </button>
                        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                          {job.jobType || 'Full-time'}
                        </span>
                      </div>
                    </div>

                    {/* All 9 Required Display Fields Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold text-gray-800 truncate">{job.location}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Experience: <strong className="text-gray-900">{typeof experienceReq === 'number' ? (experienceReq === 0 ? 'Fresher' : `${experienceReq} Yrs`) : experienceReq}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Vacancies: <strong className="text-gray-900">{remainingVacancies} / {totalVacancies}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5 sm:col-span-1">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-700 text-sm">{formatSalary(job)}</span>
                      </div>
                    </div>

                    {/* Card Footer: Posted Date & Apply Action */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Posted on {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>

                      <Link
                        to={`/jobs/${job._id}`}
                        className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                      >
                        <span>View Details & Apply</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs font-bold text-gray-600">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
