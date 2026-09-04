const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace state and useEffect
const oldStateStart = code.indexOf('const [systemMetrics, setSystemMetrics] = useState({');
const oldStateEnd = code.indexOf('  const renderOverview = () => {');
if (oldStateEnd === -1) {
    // If it's the old arrow function without braces
    code = code.replace('const renderOverview = () => (', 'const renderOverview = () => {');
}

const oldStateEnd2 = code.indexOf('  const renderOverview = () => {');

const newStateAndEffect = `const [systemMetrics, setSystemMetrics] = useState({
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
  const [categoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications()
    ]).then(([statsRes, usersRes, jobsRes, appsRes]) => {
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
    }).catch(err => {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

`;

code = code.substring(0, oldStateStart) + newStateAndEffect + code.substring(oldStateEnd2);

// Replace renderOverview
const oldOverviewStart = code.indexOf('const renderOverview = () => {');
const oldOverviewEnd = code.indexOf('const renderUsers = () => (');

const newOverview = `const renderOverview = () => {
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
                    <span className={\`px-2 py-0.5 text-[10px] font-bold rounded-full \${j.adminStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
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

  `;

code = code.substring(0, oldOverviewStart) + newOverview + code.substring(oldOverviewEnd);

fs.writeFileSync(path, code, 'utf8');
console.log('Successfully updated overview');
