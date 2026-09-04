const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add application state variables
const stateInsertionPoint = `const [selectedJobModal, setSelectedJobModal] = useState<any>(null);`;
const newStates = `const [selectedJobModal, setSelectedJobModal] = useState<any>(null);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [selectedAppModal, setSelectedAppModal] = useState<any>(null);`;
code = code.replace(stateInsertionPoint, newStates);

// 2. Replace renderApplications
const renderAppsStart = code.indexOf('const renderApplications = () => (');
const renderCategoriesStart = code.indexOf('const renderCategories = () => (');

const newRenderApps = `  const renderApplications = () => {
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
                      <span className={\`px-2 py-1 text-xs font-bold rounded-full \${
                        a.status === 'Accepted' || a.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }\`}>
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
                <span className={\`px-3 py-1 text-xs font-bold rounded-full uppercase \${
                  selectedAppModal.status === 'Accepted' || selectedAppModal.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                  selectedAppModal.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }\`}>
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
`;

code = code.substring(0, renderAppsStart) + newRenderApps + code.substring(renderCategoriesStart);

fs.writeFileSync(path, code, 'utf8');
console.log('Frontend Apps management updated');
