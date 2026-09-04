const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboards', 'JobSeekerDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const stateInjection = `
  const [profileData, setProfileData] = useState({ name: '', phone: '', location: '', skills: '', experience: 0, availability: '' });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersAPI.updateProfile(profileData);
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };
`;

content = content.replace('const [applications, setApplications] = useState<any[]>([]);', 'const [applications, setApplications] = useState<any[]>([]);\n' + stateInjection);

content = content.replace(
  '<form className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">',
  '<form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-6">'
);
content = content.replace(
  '<button type="button" onClick={() => setIsEditingProfile(false)} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n               Save Changes\n             </button>',
  '<button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 text-center">\n               Save Changes\n             </button>'
);
content = content.replace('if (isEditingProfile) {', 'if (true) {');

const renderApplicationsReplacement = `
        <div className="divide-y divide-gray-100">
           {applications.map((app: any) => (
             <div key={app._id} className="p-4 flex justify-between items-center">
               <div>
                 <h4 className="font-bold text-gray-900">{app.job?.title || 'Unknown Job'}</h4>
                 <p className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
               </div>
               <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{app.status}</span>
             </div>
           ))}
        </div>
`;
content = content.replace('{/* Map over applications here when API is ready */}', renderApplicationsReplacement);

fs.writeFileSync(filePath, content);
console.log('Fixed JobSeekerDashboard.tsx');
