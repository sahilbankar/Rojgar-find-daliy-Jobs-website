import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShieldCheck, ArrowRight, Wrench, Truck, Monitor, HeartPulse, Briefcase, ChevronDown, DollarSign, Building, User as UserIcon } from 'lucide-react';
import { Job, JobCategory } from '../types';
import { jobsAPI } from '../services/jobs.service';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  
  // States for Latest Jobs & Categories
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const res = await jobsAPI.getJobs({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
        const jobList = res.jobs || res.data || [];
        setLatestJobs(jobList);
      } catch (error) {
        console.error("Failed to fetch latest jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await jobsAPI.getCategories();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchLatestJobs();
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append('q', searchTerm);
    if (location) searchParams.append('location', location);
    if (category) searchParams.append('category', category);
    navigate(`/jobs?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>100% Real Database & Direct Vacancy Updates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find Jobs & Employment <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">
              Matching Your Skills
            </span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto font-normal leading-relaxed">
            Explore fresh job opportunities ranging from IT, office work, and driving to skilled trades (plumber, electrician, carpenter) on ROJGAR.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto text-gray-800 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title or skill..."
                className="w-full bg-transparent focus:outline-none text-sm text-gray-900"
              />
            </div>
            <div className="flex-1 flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full bg-transparent focus:outline-none text-sm text-gray-900"
              />
            </div>
            <div className="flex-1 flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 relative">
              <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-gray-900 appearance-none pr-8 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Trades & Technical">Trades & Technical</option>
                    <option value="Logistics">Logistics & Driver</option>
                    <option value="Office & Professional">Office & Professional</option>
                    <option value="Healthcare">Healthcare & Others</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-blue-700/50 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">5,000+</p>
              <p className="text-xs sm:text-sm text-blue-200">Active Jobs</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">1,200+</p>
              <p className="text-xs sm:text-sm text-blue-200">Employers & Contractors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">25,000+</p>
              <p className="text-xs sm:text-sm text-blue-200">Registered Job Seekers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-xs sm:text-sm text-blue-200">Transparent Process</p>
            </div>
          </div>

        </div>
      </section>

      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Popular Job Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore jobs based on your interests and skill categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/jobs?category=Trades+%26+Technical"
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Trades & Technical</h3>
            <p className="text-xs text-gray-500 mt-1">Carpenter, Plumber, Electrician, Welder, Painter</p>
          </Link>

          <Link
            to="/jobs?category=Logistics"
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600">Logistics & Hospitality</h3>
            <p className="text-xs text-gray-500 mt-1">Driver, Delivery, Security Guard, Hotel Staff, Cook</p>
          </Link>

          <Link
            to="/jobs?category=Office+%26+Professional"
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600">Office & Professional</h3>
            <p className="text-xs text-gray-500 mt-1">Sales, Accountant, Receptionist, Developer, Data Analyst</p>
          </Link>

          <Link
            to="/jobs?category=Healthcare"
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-rose-600">Healthcare & Others</h3>
            <p className="text-xs text-gray-500 mt-1">Nurse, Assistant, Lab Tech, General Maintenance</p>
          </Link>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Latest Jobs
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Recently posted opportunities across all categories
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="min-h-[200px]">
          {isLoadingJobs ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading latest jobs...</p>
            </div>
          ) : latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {job.employerId?.logoUrl ? (
                        <img 
                          src={job.employerId.logoUrl.startsWith('http') ? job.employerId.logoUrl : `http://localhost:5000${job.employerId.logoUrl}`} 
                          alt={`${job.companyName || 'Company'} logo`} 
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Building className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 truncate">{job.title}</h3>
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full shrink-0">
                            {job.jobType || 'Full-time'}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-0.5 mt-1">
                          <Link 
                            to={`/employers/${job.employerId?._id || job.employerId}`}
                            className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors space-x-1.5 group w-fit"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                            <span className="font-medium truncate">{job.companyName || 'Company'}</span>
                          </Link>
                          {(job as any).employerName && (
                            <div className="flex items-center text-[10px] text-gray-400 space-x-1.5">
                              <UserIcon className="w-3 h-3 text-gray-300 shrink-0" />
                              <span className="font-medium truncate">Posted by: {(job as any).employerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border border-gray-100 text-center px-4">
              <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No jobs posted yet</h3>
              <p className="text-sm text-gray-500 mt-1">Check back soon for new opportunities or browse popular categories.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">
              Are you a company or contractor?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Post a new job on ROJGAR today and find verified workers and candidates within minutes.
            </p>
          </div>
          <Link
            to="/register?role=employer"
            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-2xl transition-all shrink-0"
          >
            Post a Job
          </Link>
        </div>
      </section>

    </div>
  );
};

