const crypto = require('crypto');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const { generateToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { sendPasswordEmail } = require('../utils/emailService');

/**
 * @desc    Register a new company with admin user
 * @route   POST /api/auth/register-company
 * @access  Public
 */
const registerCompany = async (req, res, next) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, 503, 'Database connection unavailable. Please try again later or contact support.');
    }

    const {
      company_name,
      company_id,
      admin_email,
      admin_password,
      admin_name,
      office_latitude,
      office_longitude,
      subscription_plan,
      geofence_radius,
      domain
    } = req.body;

    // Generate company_id from company name if not provided
    const generatedCompanyId = company_id || 
      company_name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);

    // Check if company already exists
    const existingCompany = await Company.findOne({ 
      $or: [
        { company_name },
        { company_id: generatedCompanyId }
      ]
    });
    if (existingCompany) {
      return errorResponse(res, 400, 'Company name or ID already exists');
    }

    // Check if admin email already exists
    const existingEmployee = await Employee.findOne({ email: admin_email });
    if (existingEmployee) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Set employee limit based on subscription plan
    const employeeLimits = {
      basic: 10,
      premium: 50,
      enterprise: 500
    };

    const employee_limit = employeeLimits[subscription_plan || 'basic'];

    // Generate domain if not provided
    const companyDomain = domain || `${generatedCompanyId.toLowerCase()}.st.infodra.ai`;

    // Create company
    const company = await Company.create({
      company_id: generatedCompanyId,
      company_name,
      admin_email,
      domain: companyDomain,
      subscription_plan: subscription_plan || 'basic',
      employee_limit,
      office_location: {
        latitude: office_latitude,
        longitude: office_longitude
      },
      geofence_radius: geofence_radius || process.env.DEFAULT_GEOFENCE_RADIUS || 100
    });

    // Create admin user
    const admin = await Employee.create({
      company_id: company.company_id,
      employee_id: `${company.company_id}-ADMIN`,
      name: admin_name,
      email: admin_email,
      password: admin_password,
      role: 'admin',
      latitude: office_latitude,
      longitude: office_longitude,
      radius_meters: geofence_radius || 150
    });

    // Generate token
    const token = generateToken({ id: admin._id });

    successResponse(res, 201, {
      token,
      company: {
        id: company._id,
        company_id: company.company_id,
        name: company.company_name,
        domain: company.domain,
        subscription_plan: company.subscription_plan
      },
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }, 'Company registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login for admin or employee
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, 503, 'Database connection unavailable. Please try again later or contact support.');
    }

    const { email, password } = req.body;

    // Find employee - in multi-tenant mode, also check company
    let query = { email };
    
    // If req.company exists (from tenant middleware), enforce company isolation
    // But allow super_admin users to login without company context
    if (req.company) {
      query.company_id = req.company.company_id;
    }

    let employee = await Employee.findOne(query).select('+password');

    // If not found with company filter, try without (for super_admin login on localhost)
    if (!employee && req.company) {
      const unscoped = await Employee.findOne({ email }).select('+password');
      if (unscoped && unscoped.role === 'super_admin') {
        employee = unscoped;
      }
    }

    if (!employee) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordMatch = await employee.comparePassword(password);

    if (!isPasswordMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check if employee is active
    if (employee.status !== 'active') {
      return errorResponse(res, 403, 'Your account is not active');
    }

    // Get company
    const company = await Company.findOne({ company_id: employee.company_id });

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    if (company.status !== 'active') {
      return errorResponse(res, 403, 'Company account is not active');
    }

    // Verify tenant match (extra security) - skip for super_admin
    if (req.tenant && employee.role !== 'super_admin' && req.tenant !== employee.company_id.toLowerCase()) {
      return errorResponse(res, 403, 'Access denied: Company mismatch');
    }

    // Generate token
    const token = generateToken({ id: employee._id });

    successResponse(res, 200, {
      token,
      company: {
        id: company._id,
        company_id: company.company_id,
        name: company.company_name,
        domain: company.domain,
        subscription_plan: company.subscription_plan,
        office_location: company.office_location,
        geofence_radius: company.geofence_radius
      },
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department
      }
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - sends new password to user email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, 503, 'Database connection unavailable. Please try again later.');
    }

    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Please provide your email address');
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      // Return success even if not found to prevent email enumeration
      return successResponse(res, 200, null, 'If the email exists, a new password has been sent.');
    }

    // Generate a random 10-char password
    const newPassword = crypto.randomBytes(5).toString('hex');

    // Update password (pre-save hook will hash it)
    employee.password = newPassword;
    await employee.save();

    // Send email
    await sendPasswordEmail(employee.email, employee.name, newPassword);

    successResponse(res, 200, null, 'A new password has been sent to your email address.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCompany,
  login,
  forgotPassword
};
