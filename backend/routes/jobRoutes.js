const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  closeJob
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Include other resource routers
const applicationRouter = require('./applicationRoutes');

const Category = require('../models/Category');
const JobType = require('../models/JobType');

const router = express.Router();

// Re-route into other resource routers
router.use('/:jobId/applications', applicationRouter);

// Public: Get all categories (used by Post a Job form)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Get all job types (used by Post a Job form)
router.get('/job-types', async (req, res) => {
  try {
    let jobTypes = await JobType.find().sort('name');
    if (jobTypes.length === 0) {
      const defaults = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
      await JobType.insertMany(defaults.map(name => ({ name })));
      jobTypes = await JobType.find().sort('name');
    }
    res.status(200).json({ success: true, data: jobTypes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer', 'admin'), createJob);

router.route('/:id')
  .get(getJob)
  .put(protect, authorize('employer', 'admin'), updateJob)
  .delete(protect, authorize('employer', 'admin'), deleteJob);

router.put('/:id/close', protect, authorize('employer', 'admin'), closeJob);

module.exports = router;
