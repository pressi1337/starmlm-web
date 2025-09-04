import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or mobile is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('language')
    .isIn(['english', 'tamil'])
    .withMessage('Language must be either english or tamil'),
  validateRequest
];

export const validateVideo = [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('type')
    .isIn(['daily', 'training', 'promotion'])
    .withMessage('Type must be daily, training, or promotion'),
  body('showingDate')
    .isISO8601()
    .withMessage('Valid showing date is required'),
  validateRequest
];

export const validateQuiz = [
  body('videoId')
    .isMongoId()
    .withMessage('Valid video ID is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  validateRequest
];

export const validateWithdrawal = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Amount must be at least 100'),
  body('method')
    .isIn(['bank', 'upi'])
    .withMessage('Method must be bank or upi'),
  body('accountDetails.mobileNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Valid mobile number is required'),
  validateRequest
];