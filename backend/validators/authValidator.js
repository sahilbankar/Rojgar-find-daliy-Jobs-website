const { check, validationResult } = require('express-validator');

exports.registerValidation = [
  check('name', 'Full name is required and must be at least 2 characters')
    .trim()
    .isLength({ min: 2 }),
  check('email', 'Please provide a valid email address')
    .trim()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  check('password', 'Password must be at least 6 characters long')
    .isLength({ min: 6 }),
  check('role', 'Role must be jobseeker, employer, or admin')
    .optional()
    .isIn(['jobseeker', 'employer', 'admin']),
];

exports.loginValidation = [
  check('email', 'Please enter a valid email address')
    .trim()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  check('password', 'Password is required')
    .not()
    .isEmpty(),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const primaryMessage = errorList[0]?.msg || 'Validation failed';
    return res.status(400).json({
      success: false,
      message: primaryMessage,
      errors: errorList,
    });
  }
  next();
};
