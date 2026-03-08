const express = require('express');
const router = express.Router();
const { registerCompany, login } = require('../controllers/authController');
const {
  registerCompanyValidation,
  loginValidation
} = require('../middleware/validation');

// Register company
router.post('/register-company', registerCompanyValidation, registerCompany);

// Login
router.post('/login', loginValidation, login);

module.exports = router;
