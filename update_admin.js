const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace User Table
const userTable = `
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {usersList.filter(u => userFilter === 'all' || u.role === userFilter).map(u => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={\`px-2 py-1 text-xs font-bold rounded-full uppercase \${u.role === 'employer' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}\`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={\`px-2 py-1 text-xs font-bold rounded-full \${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}\`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => {
                        adminAPI.toggleBlockUser(u._id).then(res => {
                          setUsersList(usersList.map(user => user._id === u._id ? { ...user, isBlocked: !user.isBlocked } : user));
                        }).catch(console.error);
                      }}
                      className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}\`}
                      disabled={u.role === 'admin'}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
`;

code = code.replace('{/* Admin Table Architecture goes here */}', userTable);


// Replace Job Table
const jobTable = `
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Employer</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {jobsList.map(j => (
                <tr key={j._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{j.title}</td>
                  <td className="p-4 text-gray-500">{j.employerId?.companyName || 'Unknown'}</td>
                  <td className="p-4 text-gray-500">{j.location}</td>
                  <td className="p-4">
                    <span className={\`px-2 py-1 text-xs font-bold rounded-full \${j.adminStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : j.adminStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>
                      {j.adminStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={j.adminStatus || 'Pending'}
                      onChange={(e) => {
                        adminAPI.updateJobStatus(j._id, e.target.value).then(res => {
                           setJobsList(jobsList.map(job => job._id === j._id ? { ...job, adminStatus: e.target.value } : job));
                        }).catch(console.error);
                      }}
                      className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
`;

code = code.replace('{/* Job Row Architecture goes here */}', jobTable);


// Replace Applications Table
const appTable = `
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Applicant Name</th>
                <th className="p-4 font-bold">Job Title</th>
                <th className="p-4 font-bold">Applied Date</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {applicationsList.map(a => (
                <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{a.applicantId?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-500">{a.jobId?.title || 'Unknown Job'}</td>
                  <td className="p-4 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                      {a.status || 'Applied'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
`;

code = code.replace('{/* Applications Master List */}', appTable);

const catList = `
            {categoriesList.map(c => (
              <div key={c._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{c.name}</h4>
                    <p className="text-xs text-gray-500">{c.jobCount || 0} jobs in this category</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            ))}
`;

code = code.replace('{/* Categories Management List */}', catList);

fs.writeFileSync(path, code, 'utf8');
console.log('Successfully updated AdminDashboard.tsx');
