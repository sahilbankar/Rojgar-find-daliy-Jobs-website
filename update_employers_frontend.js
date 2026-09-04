const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Building2 import
if (!code.includes('Building2,')) {
    code = code.replace('Briefcase, FileText', 'Briefcase, FileText, Building2');
}

// 2. Add employers state variables
const stateInsertionPoint = `const [selectedUserModal, setSelectedUserModal] = useState<any>(null);`;
const newStates = `const [selectedUserModal, setSelectedUserModal] = useState<any>(null);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [employerSearchQuery, setEmployerSearchQuery] = useState('');
  const [selectedEmployerModal, setSelectedEmployerModal] = useState<any>(null);`;
code = code.replace(stateInsertionPoint, newStates);

// 3. Update useEffect
const oldPromiseAll = `    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications()
    ]).then(([statsRes, usersRes, jobsRes, appsRes]) => {`;

const newPromiseAll = `    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications(),
      adminAPI.getEmployers()
    ]).then(([statsRes, usersRes, jobsRes, appsRes, empRes]) => {`;
code = code.replace(oldPromiseAll, newPromiseAll);

const oldSetters = `      setUsersList(usersRes.data || []);
      setJobsList(jobsRes.data || []);
      setApplicationsList(appsRes.data || []);
    }).catch(err => {`;
const newSetters = `      setUsersList(usersRes.data || []);
      setJobsList(jobsRes.data || []);
      setApplicationsList(appsRes.data || []);
      setEmployersList(empRes.data || []);
    }).catch(err => {`;
code = code.replace(oldSetters, newSetters);


// 4. Create renderEmployers
const renderJobsStart = code.indexOf('const renderJobs = () => (');
const renderEmployersCode = `  const renderEmployers = () => {
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
                      <span className={\`px-2 py-1 text-xs font-bold rounded-full \${e.userId?.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}\`}>
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
                            }).catch(console.error);
                          }
                        }}
                        className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${e.userId?.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}\`}
                        title={e.userId?.isBlocked ? 'Activate' : 'Deactivate'}
                      >
                        {e.userId?.isBlocked ? 'Activate' : 'Deactivate'}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this employer?')) {
                            adminAPI.deleteEmployer(e._id).then(() => {
                              setEmployersList(employersList.filter(emp => emp._id !== e._id));
                            }).catch(console.error);
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
                  <p className={\`font-semibold \${selectedEmployerModal.userId?.isBlocked ? 'text-red-600' : 'text-emerald-600'}\`}>
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

`;
code = code.substring(0, renderJobsStart) + renderEmployersCode + code.substring(renderJobsStart);

// 5. Add Employers tab
const navItemsLine = `const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'users', label: 'Job Seekers', icon: Users },
    { id: 'employers', label: 'Employers', icon: Building2 },`;
code = code.replace(`const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'users', label: 'Users Management', icon: Users },`, navItemsLine);

// 6. Fix active tab logic
const typeTabOld = `type Tab = 'overview' | 'users' | 'jobs' | 'applications' | 'categories';`;
const typeTabNew = `type Tab = 'overview' | 'users' | 'employers' | 'jobs' | 'applications' | 'categories';`;
code = code.replace(typeTabOld, typeTabNew);

const activeTabLogic = `          {activeTab === 'users' && renderUsers()}
          {activeTab === 'employers' && renderEmployers()}`;
code = code.replace(`{activeTab === 'users' && renderUsers()}`, activeTabLogic);

// Optional: Fix the user management filter so we don't need 'employer' in the Users tab since it's redundant now.
// I'll leave the filter as is, but we renamed the tab to 'Job Seekers' in navItems.

fs.writeFileSync(path, code, 'utf8');
console.log('Employers management frontend updated');
