const express = require('express');
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
  getPlatformStats
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');
const { createCompanyBySuperAdminValidation } = require('../middleware/validation');

// All routes require authentication + super_admin role
router.use(protect);
router.use(authorize('super_admin'));

// Platform stats
router.get('/stats', getPlatformStats);

// Company CRUD
router.get('/companies', getAllCompanies);
router.get('/companies/:companyId', getCompanyDetails);
router.post('/companies', createCompanyBySuperAdminValidation, createCompany);
router.put('/companies/:companyId', updateCompany);
router.delete('/companies/:companyId', deleteCompany);

module.exports = router;
