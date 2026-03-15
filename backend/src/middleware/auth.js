const { verifyToken } = require('../utils/tokenUtils');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized to access this route');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get employee from token
    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    if (employee.status !== 'active') {
      return errorResponse(res, 403, 'Your account is not active');
    }

    // Get company (company_id is a string like 'TEC001', not ObjectId)
    const company = await Company.findOne({ company_id: employee.company_id });

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    // Only check company status for non-super_admin users
    if (employee.role !== 'super_admin' && company.status !== 'active') {
      return errorResponse(res, 403, 'Company account is not active');
    }

    // Attach to request
    req.user = employee;
    req.company = company;

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized to access this route');
  }
};

/**
 * Restrict to specific roles
 * super_admin always has access to any role-restricted route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

/**
 * Check if company has reached employee limit
 */
const checkEmployeeLimit = async (req, res, next) => {
  try {
    const company = req.company;
    
    // Count active employees in company
    const employeeCount = await Employee.countDocuments({
      company_id: company._id,
      status: 'active'
    });

    if (employeeCount >= company.employee_limit) {
      return errorResponse(
        res,
        403,
        `Employee limit reached. Your plan allows ${company.employee_limit} employees. Please upgrade your subscription.`
      );
    }

    next();
  } catch (error) {
    return errorResponse(res, 500, 'Error checking employee limit');
  }
};

module.exports = {
  protect,
  authorize,
  checkEmployeeLimit
};
