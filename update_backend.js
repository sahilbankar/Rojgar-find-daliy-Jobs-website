const fs = require('fs');

// Update adminController.js
const ctrlPath = 'backend/controllers/adminController.js';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

const toggleBlockCode = `// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block`;

const deleteUserCode = `
// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

`;

if (!ctrlContent.includes('exports.deleteUser =')) {
    ctrlContent = ctrlContent.replace(toggleBlockCode, deleteUserCode + toggleBlockCode);
    fs.writeFileSync(ctrlPath, ctrlContent);
}

// Update adminRoutes.js
const routePath = 'backend/routes/adminRoutes.js';
let routeContent = fs.readFileSync(routePath, 'utf8');

if (!routeContent.includes('deleteUser')) {
    routeContent = routeContent.replace('toggleBlockUser,', 'toggleBlockUser,\n  deleteUser,');
    routeContent = routeContent.replace("router.put('/users/:id/block', toggleBlockUser);", "router.put('/users/:id/block', toggleBlockUser);\nrouter.delete('/users/:id', deleteUser);");
    fs.writeFileSync(routePath, routeContent);
}

// Update admin.ts (frontend)
const apiPath = 'frontend/src/api/admin.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

if (!apiContent.includes('deleteUser: async')) {
    const toggleApiCode = `  toggleBlockUser: async (id: string) => {
    const response = await api.put(\`/admin/users/\${id}/block\`);
    return response.data;
  },`;
    
    const deleteApiCode = `  deleteUser: async (id: string) => {
    const response = await api.delete(\`/admin/users/\${id}\`);
    return response.data;
  },`;
    
    apiContent = apiContent.replace(toggleApiCode, toggleApiCode + '\n' + deleteApiCode);
    fs.writeFileSync(apiPath, apiContent);
}

console.log('Backend and API updated');
