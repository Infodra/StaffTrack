const Employee = require('../models/Employee');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 * @access  Private (Admin only)
 */
const createEmployee = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      department,
      location_name,
      latitude,
      longitude,
      radius_meters
    } = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Generate employee_id
    const employeeCount = await Employee.countDocuments({ 
      company_id: req.company.company_id 
    });
    const employee_id = `${req.company.company_id}-EMP${String(employeeCount + 1).padStart(3, '0')}`;

    // Create employee
    const employee = await Employee.create({
      employee_id,
      company_id: req.company.company_id,
      name,
      email,
      password,
      role: role || 'employee',
      department: department || 'General',
      location_name: location_name || 'Office Location',
      latitude: latitude,
      longitude: longitude,
      radius_meters: radius_meters || 150
    });

    // Remove password from response
    employee.password = undefined;

    successResponse(res, 201, employee, 'Employee created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees in the company
 * @route   GET /api/employees
 * @access  Private
 */
const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, department, search } = req.query;

    // Build query
    const query = { company_id: req.company.company_id };

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Get employees
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select('-password')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    successResponse(res, 200, {
      employees,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Private
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      role, 
      department, 
      status,
      location_name,
      latitude,
      longitude,
      radius_meters
    } = req.body;

    // Find employee
    const employee = await Employee.findOne({
      _id: id,
      company_id: req.company.company_id
    });

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    // Only admin can update role and status
    if ((role || status) && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admins can update role or status');
    }

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return errorResponse(res, 400, 'Email already registered');
      }
      employee.email = email;
    }

    // Update fields
    if (name) employee.name = name;
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (status) employee.status = status;
    if (location_name) employee.location_name = location_name;
    if (latitude !== undefined) employee.latitude = latitude;
    if (longitude !== undefined) employee.longitude = longitude;
    if (radius_meters !== undefined) employee.radius_meters = radius_meters;

    await employee.save();

    // Remove password from response
    employee.password = undefined;

    successResponse(res, 200, employee, 'Employee updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin only)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find employee
    const employee = await Employee.findOne({
      _id: id,
      company_id: req.company.company_id
    });

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    // Prevent deleting yourself
    if (employee._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot delete your own account');
    }

    // Delete employee
    await employee.deleteOne();

    successResponse(res, 200, null, 'Employee deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employee by ID
 * @route   GET /api/employees/:id
 * @access  Private
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      _id: id,
      company_id: req.company.company_id
    }).select('-password');

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    successResponse(res, 200, employee);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById
};
