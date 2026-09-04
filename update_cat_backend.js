const fs = require('fs');

const ctrlPath = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

const categoryMethods = `
// @desc    Create Category
// @route   POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    
    // Check if category already exists
    const Category = require('../models/Category');
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });
    
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

`;

if (!ctrlContent.includes('exports.createCategory =')) {
    ctrlContent += categoryMethods;
    fs.writeFileSync(ctrlPath, ctrlContent);
}

const routePath = 'backend/routes/adminRoutes.js';
let routeContent = fs.readFileSync(routePath, 'utf8');

if (!routeContent.includes('createCategory')) {
    routeContent = routeContent.replace('getAllApplications\n} = require(', 'getAllApplications,\n  createCategory,\n  updateCategory,\n  deleteCategory\n} = require(');
    
    const categoryRoutes = `
// Categories Management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
`;
    routeContent = routeContent.replace('module.exports = router;', categoryRoutes + '\nmodule.exports = router;');
    fs.writeFileSync(routePath, routeContent);
}

const apiPath = 'frontend/src/api/admin.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

if (!apiContent.includes('createCategory: async')) {
    const categoryApiMethods = `
  createCategory: async (data: any) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await api.put(\`/admin/categories/\${id}\`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete(\`/admin/categories/\${id}\`);
    return response.data;
  },`;
    
    apiContent = apiContent.replace('getApplications: async () => {', categoryApiMethods + '\n  getApplications: async () => {');
    fs.writeFileSync(apiPath, apiContent);
}

console.log('Backend categories API ready');
