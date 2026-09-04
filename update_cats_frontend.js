const fs = require('fs');

// 1. Update admin.ts to include getCategories
const apiPath = 'frontend/src/api/admin.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

if (!apiContent.includes('getCategories: async')) {
    const getCatApi = `  getCategories: async () => {
    const response = await api.get('/jobs/categories');
    return response.data;
  },`;
    apiContent = apiContent.replace('createCategory: async', getCatApi + '\n  createCategory: async');
    fs.writeFileSync(apiPath, apiContent);
}

// 2. Update AdminDashboard.tsx to implement renderCategories
const dashPath = 'frontend/src/pages/dashboards/AdminDashboard.tsx';
let code = fs.readFileSync(dashPath, 'utf8');

// Update Promise.all to fetch categories
const oldPromiseAll = `    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications(),
      adminAPI.getEmployers()
    ]).then(([statsRes, usersRes, jobsRes, appsRes, empRes]) => {`;

const newPromiseAll = `    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getUsers(),
      adminAPI.getJobs(),
      adminAPI.getApplications(),
      adminAPI.getEmployers(),
      adminAPI.getCategories()
    ]).then(([statsRes, usersRes, jobsRes, appsRes, empRes, catRes]) => {`;

code = code.replace(oldPromiseAll, newPromiseAll);

const oldSetters = `      setApplicationsList(appsRes.data || []);
      setEmployersList(empRes.data || []);
    }).catch(err => {`;
const newSetters = `      setApplicationsList(appsRes.data || []);
      setEmployersList(empRes.data || []);
      setCategoriesList(catRes.data || []);
    }).catch(err => {`;
code = code.replace(oldSetters, newSetters);

// Add category specific states
const stateInsertionPoint = `const [selectedAppModal, setSelectedAppModal] = useState<any>(null);`;
const newStates = `const [selectedAppModal, setSelectedAppModal] = useState<any>(null);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catFormData, setCatFormData] = useState({ name: '', description: '' });
  const [catError, setCatError] = useState('');`;
code = code.replace(stateInsertionPoint, newStates);

// Replace renderCategories
const renderCatStart = code.indexOf('const renderCategories = () => (');
const renderCatEnd = code.indexOf('const navItems = [');

const newRenderCategories = `  const renderCategories = () => {
    let filteredCats = categoriesList;
    if (catSearchQuery.trim() !== '') {
      const q = catSearchQuery.toLowerCase();
      filteredCats = filteredCats.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.description || '').toLowerCase().includes(q)
      );
    }

    const handleSaveCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      setCatError('');
      if (!catFormData.name.trim()) {
        setCatError('Category name is required.');
        return;
      }
      try {
        if (editingCategory) {
          const res = await adminAPI.updateCategory(editingCategory._id, catFormData);
          setCategoriesList(categoriesList.map(c => c._id === editingCategory._id ? res.data : c));
        } else {
          const res = await adminAPI.createCategory(catFormData);
          setCategoriesList([...categoriesList, res.data]);
        }
        setShowCatModal(false);
      } catch (err: any) {
        setCatError(err.response?.data?.message || 'Error saving category.');
      }
    };

    return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Job Categories Management</h2>
            <button 
              onClick={() => {
                setEditingCategory(null);
                setCatFormData({ name: '', description: '' });
                setCatError('');
                setShowCatModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              + Add Category
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={catSearchQuery} 
              onChange={e => setCatSearchQuery(e.target.value)} 
              className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        {filteredCats.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No categories found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no categories matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Category Name</th>
                  <th className="p-4 font-bold">Description</th>
                  <th className="p-4 font-bold">Created Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCats.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{c.name}</td>
                    <td className="p-4 text-gray-600">{c.description || 'No description provided.'}</td>
                    <td className="p-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCategory(c);
                          setCatFormData({ name: c.name, description: c.description || '' });
                          setCatError('');
                          setShowCatModal(true);
                        }}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this category? Jobs under this category may lose their association.')) {
                            adminAPI.deleteCategory(c._id).then(() => {
                              setCategoriesList(categoriesList.filter(cat => cat._id !== c._id));
                            }).catch(console.error);
                          }
                        }}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg inline-flex items-center"
                        title="Delete Category"
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

      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowCatModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {catError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                  {catError}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  placeholder="e.g. Software Development"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  placeholder="Brief description about the category..."
                  rows={3}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )};

  `;

code = code.substring(0, renderCatStart) + newRenderCategories + code.substring(renderCatEnd);
fs.writeFileSync(dashPath, code, 'utf8');

console.log('Categories frontend script generated');
