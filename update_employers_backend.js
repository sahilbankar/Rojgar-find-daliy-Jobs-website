const fs = require('fs');

// 1. Update adminController.js
const ctrlPath = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

// Update populate
ctrlContent = ctrlContent.replace(
  "populate('userId', 'name email isBlocked');", 
  "populate('userId', 'name email phone isBlocked createdAt');"
);

// Add deleteEmployer
const getAllJobsCode = `// @desc    Get all jobs`;
const deleteEmployerCode = `// @desc    Delete employer
// @route   DELETE /api/admin/employers/:id
exports.deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    await User.findByIdAndDelete(employer.userId);
    await Employer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Employer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

`;

if (!ctrlContent.includes('exports.deleteEmployer =')) {
    ctrlContent = ctrlContent.replace(getAllJobsCode, deleteEmployerCode + getAllJobsCode);
    fs.writeFileSync(ctrlPath, ctrlContent);
}

// 2. Update adminRoutes.js
const routePath = 'backend/routes/adminRoutes.js';
let routeContent = fs.readFileSync(routePath, 'utf8');

if (!routeContent.includes('deleteEmployer')) {
    routeContent = routeContent.replace('getAllEmployers,', 'getAllEmployers,\n  deleteEmployer,');
    routeContent = routeContent.replace(
        "router.get('/employers', getAllEmployers);", 
        "router.get('/employers', getAllEmployers);\nrouter.delete('/employers/:id', deleteEmployer);"
    );
    fs.writeFileSync(routePath, routeContent);
}

// 3. Update admin.ts (frontend API)
const apiPath = 'frontend/src/api/admin.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

if (!apiContent.includes('deleteEmployer: async')) {
    const getEmployersCode = `  getEmployers: async () => {
    const response = await api.get('/admin/employers');
    return response.data;
  },`;
    const deleteEmployerApiCode = `  deleteEmployer: async (id: string) => {
    const response = await api.delete(\`/admin/employers/\${id}\`);
    return response.data;
  },`;
    apiContent = apiContent.replace(getEmployersCode, getEmployersCode + '\n' + deleteEmployerApiCode);
    fs.writeFileSync(apiPath, apiContent);
}

console.log('Employers backend APIs updated');
