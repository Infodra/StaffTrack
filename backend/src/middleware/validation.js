const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      400,
      'Validation failed',
      errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    );
  }
  next();
};

/**
 * Validation rules for company registration
 */
const registerCompanyValidation = [
  body('company_name')
    .notEmpty()
    .withMessage('Company name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('admin_email')
    .notEmpty()
    .withMessage('Admin email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('admin_password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('admin_name')
    .notEmpty()
    .withMessage('Admin name is required')
    .trim(),
  body('office_latitude')
    .notEmpty()
    .withMessage('Office latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('office_longitude')
    .notEmpty()
    .withMessage('Office longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('subscription_plan')
    .optional()
    .isIn(['basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription plan'),
  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validation rules for creating employee
 */
const createEmployeeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim(),
  body('location_name')
    .optional()
    .trim(),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('radius_meters')
    .optional()
    .isInt({ min: 10, max: 10000 })
    .withMessage('Radius must be between 10 and 10000 meters'),
  validate
];

/**
 * Validation rules for updating employee
 */
const updateEmployeeValidation = [
  param('id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status'),
  validate
];

/**
 * Validation rules for login/logout
 */
const attendanceLocationValidation = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  validate
];

/**
 * Validation rules for attendance history query
 */
const attendanceHistoryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

/**
 * Validation rules for company settings update
 */
const updateCompanyValidation = [
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('office_latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('office_longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('geofence_radius')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('Geofence radius must be between 10 and 5000 meters'),
  validate
];

module.exports = {
  registerCompanyValidation,
  loginValidation,
  createEmployeeValidation,
  updateEmployeeValidation,
  attendanceLocationValidation,
  attendanceHistoryValidation,
  updateCompanyValidation
};
