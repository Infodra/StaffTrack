const express = require('express');
const router = express.Router();
const {
  getCompany,
  updateCompanySettings,
  getCompanyStats,
  getCompanyBranding
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const { updateCompanyValidation } = require('../middleware/validation');

// Public route - no auth needed (for login page branding)
router.get('/branding/:tenantId', getCompanyBranding);

// All routes below require authentication
router.use(protect);

// Get company details
router.get('/', getCompany);

// Update company settings (Admin only)
router.put('/settings', authorize('admin'), updateCompanyValidation, updateCompanySettings);

// Get company statistics (Admin only)
router.get('/stats', authorize('admin'), getCompanyStats);

module.exports = router;
