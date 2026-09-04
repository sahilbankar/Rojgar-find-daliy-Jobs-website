const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add search and modal state
const stateInsertionPoint = `  const [categoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);`;

const newStates = `  const [categoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<any>(null);`;

code = code.replace(stateInsertionPoint, newStates);

// Add Eye, Trash2, X, Search imports from lucide-react
if (!code.includes('Eye,')) {
    code = code.replace('Menu }', 'Menu, Eye, Trash2, X, Search }');
}

// Replace renderUsers
const renderUsersStart = code.indexOf('const renderUsers = () => (');
const renderUsersEnd = code.indexOf('const renderJobs = () => (');

let renderUsersCode = `const renderUsers = () => {
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
                  className={\`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors \${
                    userFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }\`}
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
                      <span className={\`px-2 py-1 text-xs font-bold rounded-full uppercase \${u.role === 'employer' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}\`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={\`px-2 py-1 text-xs font-bold rounded-full \${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}\`}>
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
                          }).catch(console.error);
                        }}
                        className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}\`}
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
                            }).catch(console.error);
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
                <span className={\`px-2.5 py-1 text-xs font-bold rounded-full uppercase \${selectedUserModal.role === 'employer' ? 'bg-blue-100 text-blue-700' : selectedUserModal.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}\`}>
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
                  <p className={\`font-semibold \${selectedUserModal.isBlocked ? 'text-red-600' : 'text-emerald-600'}\`}>
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

  `;

code = code.substring(0, renderUsersStart) + renderUsersCode + code.substring(renderUsersEnd);
fs.writeFileSync(path, code, 'utf8');
console.log('User management updated');
