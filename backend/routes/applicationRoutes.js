const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getApplicationDetails,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/authMiddleware');

// mergeParams: true allows re-routing from other routers (e.g., jobRoutes) to access params like :jobId
const router = express.Router({ mergeParams: true });

// Protect all application routes
router.use(protect);

// Routes for jobseeker
router.route('/me')
  .get(authorize('jobseeker'), getMyApplications);

// Routes specific to an application by ID
router.route('/:id')
  .get(getApplicationDetails); // Auth logic handled in controller

router.route('/:id/status')
  .put(authorize('employer', 'admin'), updateApplicationStatus);

// Routes mounted from jobs (e.g., /api/jobs/:jobId/applications)
router.route('/')
  .post(authorize('jobseeker'), applyForJob)
  .get(authorize('employer', 'admin'), getJobApplicants);

module.exports = router;
