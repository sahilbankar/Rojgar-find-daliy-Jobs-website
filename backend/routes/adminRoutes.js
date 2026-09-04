const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getAllEmployers,
  deleteEmployer,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAllApplications,
  createCategory,
  updateCategory,
  deleteCategory,
  createJobType,
  updateJobType,
  deleteJobType
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to all routes in this router
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users Management
router.route('/users')
  .get(getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

// Employers Management
router.get('/employers', getAllEmployers);
router.delete('/employers/:id', deleteEmployer);

// Jobs Management
router.route('/jobs')
  .get(getAllJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Applications Management
router.get('/applications', getAllApplications);


// Categories Management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Job Types Management
router.post('/job-types', createJobType);
router.put('/job-types/:id', updateJobType);
router.delete('/job-types/:id', deleteJobType);

module.exports = router;
