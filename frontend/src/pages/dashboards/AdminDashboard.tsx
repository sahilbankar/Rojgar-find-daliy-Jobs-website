import api from '../../services/axios';
import React, { useState } from 'react';
import { UserCircle, Users, Briefcase, FileText, Building2, ShieldCheck, Tag, Activity, Menu, Eye, Trash2, X, Search, Clock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'overview' | 'users' | 'employers' | 'jobs' | 'applications' | 'categories' | 'jobTypes' | 'contactMessages' | 'profile';
type UserFilter = 'all' | 'employer' | 'jobseeker';

import { adminAPI } from '../../services/admin';

const AdminProfileForm = ({ user }: { user: any }) => {
    const [formData, setFormData] = React.useState({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: ''
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const [msg, setMsg] = React.useState({ text: '', type: '' });
    
    // Allow avatar upload if supported
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const fd = new FormData();
        fd.append('avatar', file);
        try {
          
          await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          window.location.reload(); // Quick refresh to update avatar context
        } catch (err: any) {
          setMsg({ text: err.response?.data?.message || 'Error uploading image', type: 'error' });
        }
      }
    };

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setMsg({ text: '', type: '' });
      try {
        
        await api.put('/users/me', formData);
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        
        // Clear password field after save
        setFormData(prev => ({ ...prev, password: '' }));
      } catch (err: any) {
        setMsg({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your administrator account settings.</p>
        </div>
        
        <div className="p-6">
          {msg.text && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg border-2 border-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Profile Image</h3>
              <p className="text-sm text-gray-500">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password (Optional)</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave blank to keep current"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  
export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<any>(null);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [employerSearchQuery, setEmployerSearchQuery] = useState('');
  const [selectedEmployerModal, setSelectedEmployerModal] = useState<any>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobModal, setSelectedJobModal] = useState<any>(null);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [selectedAppModal, setSelectedAppModal] = useState<any>(null);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catFormData, setCatFormData] = useState({ name: '' });
  const [catError, setCatError] = useState('');

  const [jobTypesList, setJobTypesList] = useState<any[]>([]);
  const [jobTypeSearchQuery, setJobTypeSearchQuery] = useState('');
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  const [editingJobType, setEditingJobType] = useState<any>(null);
  const [jobTypeFormData, setJobTypeFormData] = useState({ name: '' });
  const [jobTypeError, setJobTypeError] = useState('');

  const [contactList, setContactList] = useState<any[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedContactModal, setSelectedContactModal] = useState<any>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications(),
      adminAPI.getEmployers(),
      adminAPI.getCategories(),
      adminAPI.getJobTypes(),
      adminAPI.getContactMessages()
    ]).then(([statsRes, usersRes, jobsRes, appsRes, empRes, catRes, jtRes, contactRes]) => {
      if(statsRes.data) {
        setSystemMetrics({
          totalUsers: statsRes.data.totalUsers || 0,
          totalJobSeekers: statsRes.data.totalJobSeekers || 0,
          totalEmployers: statsRes.data.totalEmployers || 0,
          totalJobs: statsRes.data.totalJobs || 0,
          activeJobs: statsRes.data.jobsByStatus?.find((j: any) => j._id === 'Approved')?.count || 0,
          totalApplications: statsRes.data.totalApplications || 0
        });
      }
      setUsersList(usersRes.data || []);
      setJobsList(jobsRes.data || []);
      setApplicationsList(appsRes.data || []);
      setEmployersList(empRes.data || []);
      setCategoriesList(catRes.data || []);
      setJobTypesList(jtRes.data || []);
      setContactList(contactRes.data || []);
    }).catch(err => { void err;
      
      setError('Failed to load dashboard data. Please try again.');
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const renderOverview = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center">
          <p className="font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Retry</button>
        </div>
      );
    }

    const recentJobSeekers = usersList.filter(u => u.role === 'jobseeker').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const recentEmployers = usersList.filter(u => u.role === 'employer').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const recentJobs = jobsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Admin Overview</h2>
          <p className="text-sm text-gray-500">System-wide metrics and platform monitoring.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">Job Seekers</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{systemMetrics.totalJobSeekers}</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs text-blue-600 font-bold uppercase">Employers</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{systemMetrics.totalEmployers}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs text-green-600 font-bold uppercase">Total Jobs</p>
            <p className="text-2xl font-black text-green-900 mt-1">{systemMetrics.totalJobs}</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs text-amber-600 font-bold uppercase">Active Jobs</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{systemMetrics.activeJobs}</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs text-purple-600 font-bold uppercase">Applications</p>
            <p className="text-2xl font-black text-purple-900 mt-1">{systemMetrics.totalApplications}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Recent Job Seekers</h3>
            {recentJobSeekers.length === 0 ? <p className="text-sm text-gray-500">No job seekers found.</p> : (
              <ul className="space-y-3">
                {recentJobSeekers.map(u => (
                  <li key={u._id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{u.name}</span>
                    <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Recent Employers</h3>
            {recentEmployers.length === 0 ? <p className="text-sm text-gray-500">No employers found.</p> : (
              <ul className="space-y-3">
                {recentEmployers.map(u => (
                  <li key={u._id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{u.name}</span>
                    <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Recent Jobs</h3>
            {recentJobs.length === 0 ? <p className="text-sm text-gray-500">No jobs found.</p> : (
              <ul className="space-y-3">
                {recentJobs.map(j => (
                  <li key={j._id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800 truncate pr-2">{j.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${j.adminStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {j.adminStatus || 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
};

  const renderUsers = () => {
    let filteredUsers = usersList.filter(u => userFilter === 'all' || u.role === userFilter);
    if (userSearchQuery.trim() !== '') {
      const q = userSearchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        (u.name || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q)
      );
    }

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            
            <div className="flex flex-wrap gap-2">
              {(['all', 'employer', 'jobseeker'] as UserFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setUserFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                    userFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'jobseeker' ? 'Job Seekers' : filter === 'employer' ? 'Employers' : 'All Users'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={userSearchQuery} 
              onChange={e => setUserSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No users found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Reg. Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{u.name}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${u.role === 'employer' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedUserModal(u)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          adminAPI.toggleBlockUser(u._id).then(() => {
                            setUsersList(usersList.map(user => user._id === u._id ? { ...user, isBlocked: !user.isBlocked } : user));
                          }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                        disabled={u.role === 'admin'}
                        title={u.isBlocked ? 'Activate' : 'Deactivate'}
                      >
                        {u.isBlocked ? 'Activate' : 'Deactivate'}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this user?')) {
                            adminAPI.deleteUser(u._id).then(() => {
                              setUsersList(usersList.filter(user => user._id !== u._id));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        disabled={u.role === 'admin'}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">User Profile</h3>
              <button onClick={() => setSelectedUserModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black text-gray-900">{selectedUserModal.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedUserModal.email}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${selectedUserModal.role === 'employer' ? 'bg-blue-100 text-blue-700' : selectedUserModal.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {selectedUserModal.role}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Phone</p>
                  <p className="font-semibold text-gray-800">{selectedUserModal.phone || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                  <p className="font-semibold text-gray-800">{selectedUserModal.location || 'Not provided'}</p>
                </div>
                {selectedUserModal.role === 'jobseeker' && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Experience</p>
                      <p className="font-semibold text-gray-800">{selectedUserModal.experience || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Skills</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUserModal.skills?.length ? (
                          selectedUserModal.skills.map((sk: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-semibold">{sk}</span>
                          ))
                        ) : 'No skills specified'}
                      </div>
                    </div>
                  </>
                )}
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Status</p>
                  <p className={`font-semibold ${selectedUserModal.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedUserModal.isBlocked ? 'Deactivated (Blocked)' : 'Active'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Registered On</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedUserModal.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};

    const renderEmployers = () => {
    let filtered = employersList;
    if (employerSearchQuery.trim() !== '') {
      const q = employerSearchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.companyName || '').toLowerCase().includes(q) || 
        (e.userId?.name || '').toLowerCase().includes(q) ||
        (e.userId?.email || '').toLowerCase().includes(q)
      );
    }

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Employers Management</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by company, name or email..." 
              value={employerSearchQuery} 
              onChange={e => setEmployerSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No employers found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Company</th>
                  <th className="p-4 font-bold">Contact Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Reg. Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{e.companyName}</td>
                    <td className="p-4 font-medium text-gray-700">{e.userId?.name}</td>
                    <td className="p-4 text-gray-500">{e.userId?.email}</td>
                    <td className="p-4 text-gray-500">{e.userId?.createdAt ? new Date(e.userId.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${e.userId?.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {e.userId?.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedEmployerModal(e)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (e.userId?._id) {
                            adminAPI.toggleBlockUser(e.userId._id).then(() => {
                              setEmployersList(employersList.map(emp => emp._id === e._id ? { ...emp, userId: { ...emp.userId, isBlocked: !emp.userId.isBlocked } } : emp));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${e.userId?.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                        title={e.userId?.isBlocked ? 'Activate' : 'Deactivate'}
                      >
                        {e.userId?.isBlocked ? 'Activate' : 'Deactivate'}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this employer?')) {
                            adminAPI.deleteEmployer(e._id).then(() => {
                              setEmployersList(employersList.filter(emp => emp._id !== e._id));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        title="Delete Employer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEmployerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Employer Profile</h3>
              <button onClick={() => setSelectedEmployerModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black text-gray-900">{selectedEmployerModal.companyName}</h4>
                  <p className="text-gray-500 text-sm">Contact: {selectedEmployerModal.userId?.name} ({selectedEmployerModal.userId?.email})</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase bg-blue-100 text-blue-700">
                  Employer
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Phone</p>
                  <p className="font-semibold text-gray-800">{selectedEmployerModal.phone || selectedEmployerModal.userId?.phone || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                  <p className="font-semibold text-gray-800">{selectedEmployerModal.location || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Address</p>
                  <p className="font-semibold text-gray-800">{selectedEmployerModal.address || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Company Description</p>
                  <p className="font-semibold text-gray-800">{selectedEmployerModal.companyDescription || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Status</p>
                  <p className={`font-semibold ${selectedEmployerModal.userId?.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedEmployerModal.userId?.isBlocked ? 'Deactivated (Blocked)' : 'Active'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Registered On</p>
                  <p className="font-semibold text-gray-800">{selectedEmployerModal.userId?.createdAt ? new Date(selectedEmployerModal.userId.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};

  const renderJobs = () => {
    let filteredJobs = jobsList;
    if (jobSearchQuery.trim() !== '') {
      const q = jobSearchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(j => 
        (j.title || '').toLowerCase().includes(q) || 
        (j.companyName || '').toLowerCase().includes(q) ||
        (j.employerId?.companyName || '').toLowerCase().includes(q)
      );
    }

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Jobs Management</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by job title or company name..." 
              value={jobSearchQuery} 
              onChange={e => setJobSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No jobs found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no jobs matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Job Title</th>
                  <th className="p-4 font-bold">Employer</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Job Type</th>
                  <th className="p-4 font-bold">Posted</th>
                  <th className="p-4 font-bold">Applicants</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredJobs.map(j => (
                  <tr key={j._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{j.title}</td>
                    <td className="p-4 font-medium text-gray-700">{j.companyName || j.employerId?.companyName || 'Unknown'}</td>
                    <td className="p-4 text-gray-500">{j.location}</td>
                    <td className="p-4 text-gray-500">{j.jobType || 'Full-time'}</td>
                    <td className="p-4 text-gray-500">{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-blue-600">{j.applicantCount || 0}</td>
                    <td className="p-4">
                      <select 
                        value={j.adminStatus || 'Pending'}
                        onChange={(e) => {
                          adminAPI.updateJobStatus(j._id, e.target.value).then(() => {
                             setJobsList(jobsList.map(job => job._id === j._id ? { ...job, adminStatus: e.target.value } : job));
                          }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                        }}
                        className={`px-2 py-1 border rounded-lg text-xs outline-none cursor-pointer font-bold ${
                          j.adminStatus === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          j.adminStatus === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedJobModal(j)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this job? This will also remove all applications for this job.')) {
                            adminAPI.deleteJob(j._id).then(() => {
                              setJobsList(jobsList.filter(job => job._id !== j._id));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              <button onClick={() => setSelectedJobModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-2xl font-black text-gray-900">{selectedJobModal.title}</h4>
                  <p className="text-gray-500 font-medium mt-1">{selectedJobModal.companyName || selectedJobModal.employerId?.companyName || 'Unknown Company'}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                  selectedJobModal.adminStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  selectedJobModal.adminStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {selectedJobModal.adminStatus || 'Pending'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Type</p>
                  <p className="font-semibold text-gray-800">{selectedJobModal.jobType || 'Full-time'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                  <p className="font-semibold text-gray-800">{selectedJobModal.location || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Vacancies</p>
                  <p className="font-semibold text-gray-800">{selectedJobModal.totalVacancies || 1}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                  <p className="text-xs font-bold text-blue-400 uppercase mb-1">Applicants</p>
                  <p className="font-bold text-blue-700">{selectedJobModal.applicantCount || 0}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-gray-900 mb-2">Description</h5>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedJobModal.description}</p>
                </div>
                {selectedJobModal.requirements && selectedJobModal.requirements.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 mb-2">Requirements</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      {selectedJobModal.requirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Salary Range</span>
                    <span className="font-medium text-gray-800">{selectedJobModal.salaryRange || 'Not disclosed'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Experience Required</span>
                    <span className="font-medium text-gray-800">{selectedJobModal.experience ? (typeof selectedJobModal.experience === 'number' ? (selectedJobModal.experience === 0 ? 'Fresher' : `${selectedJobModal.experience} Years`) : selectedJobModal.experience) : 'Fresher'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Posted On</span>
                    <span className="font-medium text-gray-800">{new Date(selectedJobModal.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Deadline</span>
                    <span className="font-medium text-gray-800">{selectedJobModal.applicationDeadline ? new Date(selectedJobModal.applicationDeadline).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};
  const renderApplications = () => {
    let filteredApps = applicationsList;
    if (appSearchQuery.trim() !== '') {
      const q = appSearchQuery.toLowerCase();
      filteredApps = filteredApps.filter(a => 
        (a.applicantId?.name || '').toLowerCase().includes(q) || 
        (a.jobId?.title || '').toLowerCase().includes(q) ||
        (a.jobId?.companyName || '').toLowerCase().includes(q) ||
        (a.jobId?.employerId?.companyName || '').toLowerCase().includes(q)
      );
    }

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Platform Applications</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by applicant, job title, or company..." 
              value={appSearchQuery} 
              onChange={e => setAppSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No applications</h3>
            <p className="text-sm text-gray-500 mt-1">There are no applications matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Applicant Name</th>
                  <th className="p-4 font-bold">Job Title</th>
                  <th className="p-4 font-bold">Employer</th>
                  <th className="p-4 font-bold">Applied Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredApps.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{a.applicantId?.name || 'Unknown'}</td>
                    <td className="p-4 font-medium text-gray-700">{a.jobId?.title || 'Unknown Job'}</td>
                    <td className="p-4 text-gray-500">{a.jobId?.companyName || a.jobId?.employerId?.companyName || 'Unknown'}</td>
                    <td className="p-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        a.status === 'Accepted' || a.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.status || 'Applied'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedAppModal(a)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedAppModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-2xl font-black text-gray-900">{selectedAppModal.applicantId?.name || 'Unknown Applicant'}</h4>
                  <p className="text-gray-500 font-medium mt-1">{selectedAppModal.applicantId?.email || 'No email provided'}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                  selectedAppModal.status === 'Accepted' || selectedAppModal.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                  selectedAppModal.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {selectedAppModal.status || 'Applied'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applied For Job</p>
                  <p className="font-semibold text-gray-800">{selectedAppModal.jobId?.title || 'Unknown Job'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Employer / Company</p>
                  <p className="font-semibold text-gray-800">{selectedAppModal.jobId?.companyName || selectedAppModal.jobId?.employerId?.companyName || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applicant Phone</p>
                  <p className="font-semibold text-gray-800">{selectedAppModal.applicantId?.phone || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applied Date</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedAppModal.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applicant Experience</p>
                  <p className="font-semibold text-gray-800">{selectedAppModal.experience || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-gray-900 mb-2">Cover Letter</h5>
                  {selectedAppModal.coverLetter ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedAppModal.coverLetter}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No cover letter provided.</p>
                  )}
                </div>
                
                {selectedAppModal.resumeUrl && (
                  <div className="pt-2">
                    <a 
                      href={selectedAppModal.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Attached Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};
  const renderCategories = () => {
    let filteredCats = categoriesList;
    if (catSearchQuery.trim() !== '') {
      const q = catSearchQuery.toLowerCase();
      filteredCats = filteredCats.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.description || '').toLowerCase().includes(q)
      );
    }

    const handleSaveCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      setCatError('');
      if (!catFormData.name.trim()) {
        setCatError('Category name is required.');
        return;
      }
      try {
        if (editingCategory) {
          const res = await adminAPI.updateCategory(editingCategory._id, catFormData);
          setCategoriesList(categoriesList.map(c => c._id === editingCategory._id ? res.data : c));
        } else {
          const res = await adminAPI.createCategory(catFormData);
          setCategoriesList([...categoriesList, res.data]);
        }
        setShowCatModal(false);
      } catch (err: any) {
        setCatError(err.response?.data?.message || 'Error saving category.');
      }
    };

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Job Categories Management</h2>
            <button 
              onClick={() => {
                setEditingCategory(null);
                setCatFormData({ name: '' });
                setCatError('');
                setShowCatModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              + Add Category
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={catSearchQuery} 
              onChange={e => setCatSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredCats.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No categories found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no categories matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Category Name</th>
                  <th className="p-4 font-bold">Description</th>
                  <th className="p-4 font-bold">Created Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCats.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{c.name}</td>
                    <td className="p-4 text-gray-600">{c.description || 'No description provided.'}</td>
                    <td className="p-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCategory(c);
                          setCatFormData({ name: c.name });
                          setCatError('');
                          setShowCatModal(true);
                        }}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this category? Jobs under this category may lose their association.')) {
                            adminAPI.deleteCategory(c._id).then(() => {
                              setCategoriesList(categoriesList.filter(cat => cat._id !== c._id));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while processing your request.'));
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowCatModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {catError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                  {catError}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  placeholder="e.g. Software Development"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )};

  const renderJobTypes = () => {
    let filteredTypes = jobTypesList;
    if (jobTypeSearchQuery.trim() !== '') {
      const q = jobTypeSearchQuery.toLowerCase();
      filteredTypes = filteredTypes.filter(jt => 
        (jt.name || '').toLowerCase().includes(q)
      );
    }

    const handleSaveJobType = async (e: React.FormEvent) => {
      e.preventDefault();
      setJobTypeError('');
      if (!jobTypeFormData.name.trim()) {
        setJobTypeError('Job Type name is required.');
        return;
      }
      try {
        if (editingJobType) {
          const res = await adminAPI.updateJobType(editingJobType._id, jobTypeFormData);
          setJobTypesList(jobTypesList.map(jt => jt._id === editingJobType._id ? res.data : jt));
        } else {
          const res = await adminAPI.createJobType(jobTypeFormData);
          setJobTypesList([...jobTypesList, res.data]);
        }
        setShowJobTypeModal(false);
      } catch (err: any) {
        setJobTypeError(err.response?.data?.message || 'Error saving job type.');
      }
    };

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Job Types Management</h2>
            <button 
              onClick={() => {
                setEditingJobType(null);
                setJobTypeFormData({ name: '' });
                setJobTypeError('');
                setShowJobTypeModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              + Add Job Type
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search job types..." 
              value={jobTypeSearchQuery} 
              onChange={e => setJobTypeSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredTypes.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Clock className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No job types found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no job types matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Job Type Name</th>
                  <th className="p-4 font-bold">Created Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTypes.map(jt => (
                  <tr key={jt._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{jt.name}</td>
                    <td className="p-4 text-gray-500">{new Date(jt.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setEditingJobType(jt);
                          setJobTypeFormData({ name: jt.name });
                          setJobTypeError('');
                          setShowJobTypeModal(true);
                        }}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this job type?')) {
                            adminAPI.deleteJobType(jt._id).then(() => {
                              setJobTypesList(jobTypesList.filter(item => item._id !== jt._id));
                            }).catch(err => alert(err.response?.data?.message || 'An error occurred while deleting.'));
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        title="Delete Job Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showJobTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingJobType ? 'Edit Job Type' : 'Add Job Type'}</h3>
              <button onClick={() => setShowJobTypeModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveJobType} className="p-6 space-y-4">
              {jobTypeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                  {jobTypeError}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Job Type Name</label>
                <input 
                  type="text" 
                  value={jobTypeFormData.name}
                  onChange={(e) => setJobTypeFormData({ ...jobTypeFormData, name: e.target.value })}
                  placeholder="e.g. Full-time, Remote, Internship..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowJobTypeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  {editingJobType ? 'Save Changes' : 'Create Job Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )};

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    setDeletingContactId(id);
    try {
      await adminAPI.deleteContactMessage(id);
      setContactList(prev => prev.filter(c => c._id !== id));
      if (selectedContactModal && selectedContactModal._id === id) {
        setSelectedContactModal(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete contact message.');
    } finally {
      setDeletingContactId(null);
    }
  };

  const renderContactMessages = () => {
    let filtered = contactList;
    if (contactSearchQuery.trim()) {
      const q = contactSearchQuery.toLowerCase().trim();
      filtered = contactList.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.message || '').toLowerCase().includes(q)
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Contact Messages</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage customer inquiries and feedback submitted via Contact Us.</p>
          </div>
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-100">
            Total Messages: {contactList.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or message keyword..."
            value={contactSearchQuery}
            onChange={(e) => setContactSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Mail className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No contact messages found</h3>
              <p className="text-sm text-gray-500 mt-1">Submissions from the Contact Us form will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Customer Name</th>
                    <th className="p-4 font-bold">Email Address</th>
                    <th className="p-4 font-bold">Message Preview</th>
                    <th className="p-4 font-bold">Submitted Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filtered.map((item: any) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{item.name}</td>
                      <td className="p-4 text-blue-600 font-medium">{item.email}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.message}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedContactModal(item)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg inline-flex items-center space-x-1 text-xs font-semibold"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteContact(item._id)}
                          disabled={deletingContactId === item._id}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center space-x-1 text-xs font-semibold disabled:opacity-50"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Contact Message Detail Modal */}
        {selectedContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Contact Submission Details</h3>
                <button onClick={() => setSelectedContactModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Customer Name</span>
                    <p className="font-black text-gray-900 text-base mt-0.5">{selectedContactModal.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                    <a href={`mailto:${selectedContactModal.email}`} className="font-semibold text-blue-600 hover:underline text-sm block mt-0.5">
                      {selectedContactModal.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Submitted On</span>
                    <p className="text-xs font-medium text-gray-600 mt-0.5">
                      {selectedContactModal.createdAt ? new Date(selectedContactModal.createdAt).toLocaleString('en-IN') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Message</span>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedContactModal.message}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                <button
                  onClick={() => setSelectedContactModal(null)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm rounded-xl transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedContactModal.email}?subject=Re: Contact Query - ROJGAR Platform`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => <AdminProfileForm user={user} />;

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'users', label: 'Job Seekers', icon: Users },
    { id: 'employers', label: 'Employers', icon: Building2 },
    { id: 'jobs', label: 'Jobs & Approvals', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'jobTypes', label: 'Job Types', icon: Clock },
    { id: 'contactMessages', label: 'Contact Messages', icon: Mail },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-3">
           {user?.avatarUrl ? (
             <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
           ) : (
             <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
               <ShieldCheck className="w-6 h-6" />
             </div>
           )}
           <div>
             <h3 className="font-bold text-gray-900 text-sm leading-tight">{user?.name || 'Administrator'}</h3>
             <span className="text-xs text-purple-600 font-semibold capitalize">{user?.role || 'Admin'}</span>
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
            {user?.avatarUrl ? (
              <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="Avatar" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{user?.name || 'Admin'}</h3>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold tracking-wider bg-purple-50 text-purple-700 rounded uppercase">
                {user?.role || 'Administrator'}
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
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'employers' && renderEmployers()}
          {activeTab === 'jobs' && renderJobs()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'jobTypes' && renderJobTypes()}
          {activeTab === 'contactMessages' && renderContactMessages()}
          {activeTab === 'profile' && renderProfile()}
        </main>
      </div>
    </div>
  );
};
