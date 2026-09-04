const fs = require('fs');
const dashboardPath = 'frontend/src/pages/dashboards/EmployerDashboard.tsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

const startIdx = content.indexOf('const renderApplicants = () => ');
const endIdx = content.indexOf('const navItems: {');

if (startIdx !== -1 && endIdx !== -1) {
    const newRenderApp = `const renderApplicants = () => {
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

    const getAppStatusColor = (st) => {
      if (['Selected', 'Accepted'].includes(st)) return 'bg-emerald-100 text-emerald-700';
      if (['Rejected'].includes(st)) return 'bg-red-100 text-red-700';
      if (['Shortlisted', 'Interview Scheduled'].includes(st)) return 'bg-purple-100 text-purple-700';
      return 'bg-amber-100 text-amber-700';
    };

    const formatDate = (dateString) => {
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
              {selectedJobForApplicants ? \`Applicants for: \${selectedJobForApplicants.title}\` : 'All Applicants'}
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
                          className={\`px-2.5 py-1 text-xs font-bold rounded-full border-none outline-none appearance-none cursor-pointer \${getAppStatusColor(app.status)}\`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Pending">Pending</option>
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
                        {app.applicantId?.resumeUrl && (
                          <a href={app.applicantId.resumeUrl.startsWith('http') ? app.applicantId.resumeUrl : \`http://localhost:5000\${app.applicantId.resumeUrl}\`} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg inline-flex" title="View Resume">
                            <FileText className="w-4 h-4" />
                          </a>
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
                  </div>
                  <span className={\`px-3 py-1 text-xs font-bold rounded-full \${getAppStatusColor(applicantViewModal.status)}\`}>
                    {applicantViewModal.status}
                  </span>
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
                        applicantViewModal.applicantId.skills.map((sk, i) => (
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
                
                {applicantViewModal.applicantId?.resumeUrl && (
                  <div className="pt-4 border-t border-gray-100 flex gap-3">
                    <a href={applicantViewModal.applicantId.resumeUrl.startsWith('http') ? applicantViewModal.applicantId.resumeUrl : \`http://localhost:5000\${applicantViewModal.applicantId.resumeUrl}\`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                      <FileText className="w-4 h-4" /> View Resume
                    </a>
                    <a href={applicantViewModal.applicantId.resumeUrl.startsWith('http') ? applicantViewModal.applicantId.resumeUrl : \`http://localhost:5000\${applicantViewModal.applicantId.resumeUrl}\`} download className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4" /> Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };
  
  `;
    
    // Also remove any duplicated getApplicants() blocks from the effect.
    // They look like: employersAPI.getApplicants().then(...).catch(...)
    
    // First, do the string replace of renderApplicants
    let before = content.substring(0, startIdx);
    let after = content.substring(endIdx);
    
    // Clean up duplicated lines in `before` block
    // It's easier to just find the duplicated block and replace with empty.
    
    content = before + newRenderApp + after;
    
    fs.writeFileSync(dashboardPath, content, 'utf8');
    console.log('Successfully replaced renderApplicants in EmployerDashboard.tsx');
} else {
    console.log('Could not find start or end index');
}
