const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  uploadResume,
  uploadAvatar,
  getSavedJobs,
  saveJob,
  removeSavedJob
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { uploadResume: uploadResumeMW, uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/me')
  .get(getUserProfile)
  .put(updateUserProfile);

router.post('/me/resume', uploadResumeMW.single('resume'), uploadResume);
router.post('/me/avatar', uploadImage.single('avatar'), uploadAvatar);

router.get('/me/saved-jobs', getSavedJobs);
router.post('/me/saved-jobs/:jobId', saveJob);
router.delete('/me/saved-jobs/:jobId', removeSavedJob);

module.exports = router;
