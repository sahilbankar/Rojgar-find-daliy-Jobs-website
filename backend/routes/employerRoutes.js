const express = require('express');
const {
  getEmployerProfile,
  updateEmployerProfile,
  getEmployerJobs,
  uploadLogo,
  getEmployerStats,
  getEmployerApplicants,
  getEmployerById
} = require('../controllers/employerController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public route to get employer by ID
router.get('/public/:id', getEmployerById);

router.use(protect);
router.use(authorize('employer', 'admin'));

router.route('/me')
  .get(getEmployerProfile)
  .put(updateEmployerProfile)
  .post(updateEmployerProfile); 

router.post('/me/logo', uploadImage.single('logo'), uploadLogo);
router.get('/me/jobs', getEmployerJobs);
router.get('/me/stats', getEmployerStats);
router.get('/me/applicants', getEmployerApplicants);

module.exports = router;
