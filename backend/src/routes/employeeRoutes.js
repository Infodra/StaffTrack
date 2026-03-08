const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById
} = require('../controllers/employeeController');
const { protect, authorize, checkEmployeeLimit } = require('../middleware/auth');
const {
  createEmployeeValidation,
  updateEmployeeValidation
} = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Get all employees
router.get('/', getEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create employee (Admin only, check employee limit)
router.post(
  '/',
  authorize('admin'),
  checkEmployeeLimit,
  createEmployeeValidation,
  createEmployee
);

// Update employee
router.put('/:id', updateEmployeeValidation, updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
