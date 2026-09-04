const fs = require('fs');
const path = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add UserCircle to imports if not there
if (!code.includes('UserCircle')) {
    code = code.replace("import { Users,", "import { UserCircle, Users,");
}

// 2. Add 'profile' to Tab type
code = code.replace("type Tab = 'overview' | 'users' | 'employers' | 'jobs' | 'applications' | 'categories';", "type Tab = 'overview' | 'users' | 'employers' | 'jobs' | 'applications' | 'categories' | 'profile';");

// 3. Add to navItems
const navItemsReplacement = `const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'users', label: 'Job Seekers', icon: Users },
    { id: 'employers', label: 'Employers', icon: Building2 },
    { id: 'jobs', label: 'Jobs & Approvals', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle },
  ];`;
code = code.replace(/const navItems = \[[\s\S]*?\];/, navItemsReplacement);

// 4. Implement renderProfile()
const renderProfileStart = `  const renderProfile = () => {
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
          const api = require('../../api/axios').default;
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
        const api = require('../../api/axios').default;
        const res = await api.put('/users/me', formData);
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
            <div className={\`p-4 mb-6 rounded-xl text-sm font-bold \${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}\`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
`;

// Insert renderProfile right before navItems
const navItemsIndex = code.indexOf('const navItems = [');
code = code.slice(0, navItemsIndex) + renderProfileStart + '\n  ' + code.slice(navItemsIndex);

// Add to Main Content Area
code = code.replace(
  "{activeTab === 'categories' && renderCategories()}",
  "{activeTab === 'categories' && renderCategories()}\n          {activeTab === 'profile' && renderProfile()}"
);

fs.writeFileSync(path, code, 'utf8');
console.log('Admin Profile script applied successfully');
