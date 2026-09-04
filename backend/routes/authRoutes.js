const express = require('express');
const { register, login, refreshToken, logout, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation, validate } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

module.exports = router;

