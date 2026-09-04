const express = require('express');
const router = express.Router();
const { submitContactForm, getContactMessages, deleteContactMessage } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', submitContactForm);
router.get('/', protect, authorize('admin'), getContactMessages);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
