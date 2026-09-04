const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add jobs state variables
const stateInsertionPoint = `const [selectedEmployerModal, setSelectedEmployerModal] = useState<any>(null);`;
const newStates = `const [selectedEmployerModal, setSelectedEmployerModal] = useState<any>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobModal, setSelectedJobModal] = useState<any>(null);`;
code = code.replace(stateInsertionPoint, newStates);

// 2. Replace renderJobs
const renderJobsStart = code.indexOf('const renderJobs = () => (');
const renderApplicationsStart = code.indexOf('const renderApplications = () => (');

const newRenderJobs = `  const renderJobs = () => {
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
                          }).catch(console.error);
                        }}
                        className={\`px-2 py-1 border rounded-lg text-xs outline-none cursor-pointer font-bold \${
                          j.adminStatus === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          j.adminStatus === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }\`}
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
                            }).catch(console.error);
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
                <span className={\`px-3 py-1 text-xs font-bold rounded-full uppercase \${
                  selectedJobModal.adminStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  selectedJobModal.adminStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }\`}>
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
                    <span className="font-medium text-gray-800">{selectedJobModal.experience ? \`\${selectedJobModal.experience} years\` : 'Fresher'}</span>
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
`;

code = code.substring(0, renderJobsStart) + newRenderJobs + code.substring(renderApplicationsStart);

fs.writeFileSync(path, code, 'utf8');
console.log('Frontend Jobs management updated');
