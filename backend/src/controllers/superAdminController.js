const mongoose = require('mongoose');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    Create a new company with its admin
 * @route   POST /api/super-admin/companies
 * @access  Private (Super Admin only)
 */
const createCompany = async (req, res, next) => {
  try {
    const {
      company_name,
      company_id,
      admin_email,
      admin_password,
      admin_name,
      office_latitude,
      office_longitude,
      geofence_radius,
      employee_limit,
      license_type,
      domain,
      logo
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

    // Generate domain: e.g., tecinfo.stafftrack.infodra.ai
    const companyDomain = domain ||
      `${generatedCompanyId.toLowerCase()}.stafftrack.infodra.ai`;

    // Create company
    const company = await Company.create({
      company_id: generatedCompanyId,
      company_name,
      admin_email,
      domain: companyDomain,
      logo: logo || '',
      employee_limit: employee_limit || 50,
      license_type: license_type || 'lifetime',
      office_location: {
        latitude: office_latitude,
        longitude: office_longitude
      },
      geofence_radius: geofence_radius || 100,
      created_by: req.user._id
    });

    // Create admin user for that company
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

    admin.password = undefined;

    successResponse(res, 201, {
      company: {
        id: company._id,
        company_id: company.company_id,
        name: company.company_name,
        domain: company.domain,
        logo: company.logo,
        admin_email: company.admin_email,
        employee_limit: company.employee_limit,
        license_type: company.license_type,
        status: company.status
      },
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }, 'Company and admin created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies
 * @route   GET /api/super-admin/companies
 * @access  Private (Super Admin only)
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { company_name: { $regex: search, $options: 'i' } },
        { company_id: { $regex: search, $options: 'i' } },
        { admin_email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(query)
    ]);

    // Get employee counts for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const employeeCount = await Employee.countDocuments({
          company_id: company.company_id,
          role: { $ne: 'super_admin' }
        });

        return {
          id: company._id,
          company_id: company.company_id,
          name: company.company_name,
          admin_email: company.admin_email,
          domain: company.domain,
          logo: company.logo,
          employee_limit: company.employee_limit,
          employee_count: employeeCount,
          license_type: company.license_type,
          status: company.status,
          office_location: company.office_location,
          geofence_radius: company.geofence_radius,
          created_at: company.created_at
        };
      })
    );

    successResponse(res, 200, {
      companies: companiesWithStats,
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
 * @desc    Get a single company details
 * @route   GET /api/super-admin/companies/:companyId
 * @access  Private (Super Admin only)
 */
const getCompanyDetails = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findOne({ company_id: companyId.toUpperCase() });
    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    // Get employees for this company
    const [employees, totalEmployees, activeEmployees] = await Promise.all([
      Employee.find({ company_id: company.company_id, role: { $ne: 'super_admin' } })
        .select('-password')
        .sort({ created_at: -1 }),
      Employee.countDocuments({ company_id: company.company_id, role: { $ne: 'super_admin' } }),
      Employee.countDocuments({ company_id: company.company_id, status: 'active', role: { $ne: 'super_admin' } })
    ]);

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({
      company_id: company.company_id,
      date: today
    });

    successResponse(res, 200, {
      company: {
        id: company._id,
        company_id: company.company_id,
        name: company.company_name,
        admin_email: company.admin_email,
        domain: company.domain,
        logo: company.logo,
        employee_limit: company.employee_limit,
        license_type: company.license_type,
        status: company.status,
        office_location: company.office_location,
        geofence_radius: company.geofence_radius,
        created_at: company.created_at
      },
      stats: {
        total_employees: totalEmployees,
        active_employees: activeEmployees,
        today_attendance: todayAttendance
      },
      employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company details
 * @route   PUT /api/super-admin/companies/:companyId
 * @access  Private (Super Admin only)
 */
const updateCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const {
      company_name,
      employee_limit,
      license_type,
      status,
      geofence_radius,
      office_latitude,
      office_longitude,
      domain,
      logo
    } = req.body;

    const company = await Company.findOne({ company_id: companyId.toUpperCase() });
    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    if (company_name) company.company_name = company_name;
    if (employee_limit !== undefined) company.employee_limit = employee_limit;
    if (license_type) company.license_type = license_type;
    if (status) company.status = status;
    if (geofence_radius !== undefined) company.geofence_radius = geofence_radius;
    if (domain) company.domain = domain;
    if (logo !== undefined) company.logo = logo;
    if (office_latitude !== undefined && office_longitude !== undefined) {
      company.office_location = {
        latitude: office_latitude,
        longitude: office_longitude
      };
    }

    await company.save();

    successResponse(res, 200, {
      id: company._id,
      company_id: company.company_id,
      name: company.company_name,
      domain: company.domain,
      logo: company.logo,
      employee_limit: company.employee_limit,
      license_type: company.license_type,
      status: company.status
    }, 'Company updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a company and all its data
 * @route   DELETE /api/super-admin/companies/:companyId
 * @access  Private (Super Admin only)
 */
const deleteCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findOne({ company_id: companyId.toUpperCase() });
    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    // Prevent deleting the super admin's own company
    if (company.company_id === req.user.company_id) {
      return errorResponse(res, 400, 'Cannot delete your own company');
    }

    // Delete all employees of this company
    await Employee.deleteMany({ company_id: company.company_id });

    // Delete all attendance records
    await Attendance.deleteMany({ company_id: company.company_id });

    // Delete the company
    await company.deleteOne();

    successResponse(res, 200, null, 'Company and all associated data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform-wide statistics
 * @route   GET /api/super-admin/stats
 * @access  Private (Super Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      totalEmployees,
      activeEmployees
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ status: 'active' }),
      Employee.countDocuments({ role: { $ne: 'super_admin' } }),
      Employee.countDocuments({ status: 'active', role: { $ne: 'super_admin' } })
    ]);

    // Today's attendance across all companies
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({ date: today });

    successResponse(res, 200, {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        suspended: totalCompanies - activeCompanies
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees
      },
      today_attendance: todayAttendance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
  getPlatformStats
};
