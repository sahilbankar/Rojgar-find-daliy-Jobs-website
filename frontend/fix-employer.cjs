const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboards', 'EmployerDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add states for forms
const stateInjection = `
  const [profileData, setProfileData] = useState({ companyName: '', industry: '', location: '', description: '' });
  const [jobData, setJobData] = useState({ title: '', category: '', location: '', totalVacancies: 1, jobType: 'Full-time', salary: 0, experience: 0, description: '' });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employersAPI.updateProfile(profileData);
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming a generic api post to jobs for the employer
      // or we just call the api directly
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('rojgar_token')}\`
        },
        body: JSON.stringify(jobData)
      });
      if(response.ok) {
         alert('Job posted successfully!');
         setActiveTab('jobs');
         employersAPI.getJobs().then(res => setJobs(res.data || []));
      } else {
         alert('Failed to post job');
      }
    } catch (err) {
      console.error(err);
    }
  };
`;

content = content.replace('const [applicants, setApplicants] = useState<any[]>([]);', 'const [applicants, setApplicants] = useState<any[]>([]);\n' + stateInjection);

// Fix renderProfile form
content = content.replace(
  '<form className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">',
  '<form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">'
);
content = content.replace(
  '<button type="button" onClick={() => setIsEditingProfile(false)} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n               Save Changes\n             </button>',
  '<button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n               Save Changes\n             </button>'
);

// Fix renderPostJob form
content = content.replace(
  '<form className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">',
  '<form onSubmit={handleJobSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">'
);
content = content.replace(
  '<button type="button" onClick={() => setActiveTab(\'jobs\')} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n             Publish Job\n           </button>',
  '<button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n             Publish Job\n           </button>'
);

// Actually render jobs instead of comments
const renderJobsReplacement = `
        <div className="divide-y divide-gray-100">
           {jobs.map((job: any) => (
             <div key={job._id} className="p-4 flex justify-between items-center">
               <div>
                 <h4 className="font-bold text-gray-900">{job.title}</h4>
                 <p className="text-sm text-gray-500">{job.location} • {job.jobType}</p>
               </div>
               <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{job.adminStatus}</span>
             </div>
           ))}
        </div>
`;
content = content.replace('{/* Map over jobs here when API is ready */}', renderJobsReplacement);

// Actually render profile fields without static form check
content = content.replace('if (isEditingProfile) {', 'if (true) {');

fs.writeFileSync(filePath, content);
console.log('Fixed EmployerDashboard.tsx');
