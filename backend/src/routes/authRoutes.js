const express = require('express');
const router = express.Router();
const { registerCompany, login, forgotPassword } = require('../controllers/authController');
const {
  registerCompanyValidation,
  loginValidation,
  forgotPasswordValidation
} = require('../middleware/validation');

// Register company
router.post('/register-company', registerCompanyValidation, registerCompany);

// Login
router.post('/login', loginValidation, login);

// Forgot password
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

module.exports = router;
