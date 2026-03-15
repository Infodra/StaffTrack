const Company = require('../models/Company');
const Employee = require('../models/Employee');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    Get company details
 * @route   GET /api/company
 * @access  Private
 */
const getCompany = async (req, res, next) => {
  try {
    const company = req.company;

    // Get employee count
    const employeeCount = await Employee.countDocuments({
      company_id: company.company_id,
      status: 'active'
    });

    successResponse(res, 200, {
      id: company._id,
      name: company.company_name,
      admin_email: company.admin_email,
      subscription_plan: company.subscription_plan,
      employee_limit: company.employee_limit,
      employee_count: employeeCount,
      office_location: company.office_location,
      geofence_radius: company.geofence_radius,
      status: company.status,
      created_at: company.created_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company settings
 * @route   PUT /api/company/settings
 * @access  Private (Admin only)
 */
const updateCompanySettings = async (req, res, next) => {
  try {
    const {
      company_name,
      office_latitude,
      office_longitude,
      geofence_radius
    } = req.body;

    const company = req.company;

    // Update fields
    if (company_name) {
      // Check if company name already exists
      const existingCompany = await Company.findOne({
        company_name,
        _id: { $ne: company._id }
      });

      if (existingCompany) {
        return errorResponse(res, 400, 'Company name already exists');
      }

      company.company_name = company_name;
    }

    if (office_latitude !== undefined && office_longitude !== undefined) {
      company.office_location = {
        latitude: office_latitude,
        longitude: office_longitude
      };
    }

    if (geofence_radius !== undefined) {
      company.geofence_radius = geofence_radius;
    }

    await company.save();

    successResponse(res, 200, {
      id: company._id,
      name: company.company_name,
      office_location: company.office_location,
      geofence_radius: company.geofence_radius
    }, 'Company settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get company statistics (Admin only)
 * @route   GET /api/company/stats
 * @access  Private (Admin only)
 */
const getCompanyStats = async (req, res, next) => {
  try {
    const company = req.company;

    // Get employee statistics
    const [totalEmployees, activeEmployees, inactiveEmployees] = await Promise.all([
      Employee.countDocuments({ company_id: company.company_id }),
      Employee.countDocuments({ company_id: company.company_id, status: 'active' }),
      Employee.countDocuments({ company_id: company.company_id, status: 'inactive' })
    ]);

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD string

    const Attendance = require('../models/Attendance');
    const [checkedInToday, checkedOutToday] = await Promise.all([
      Attendance.countDocuments({
        company_id: company.company_id,
        date: today
      }),
      Attendance.countDocuments({
        company_id: company.company_id,
        date: today,
        check_out: { $ne: null }
      })
    ]);

    successResponse(res, 200, {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        limit: company.employee_limit,
        remaining: company.employee_limit - activeEmployees
      },
      attendance_today: {
        checked_in: checkedInToday,
        checked_out: checkedOutToday,
        currently_in_office: checkedInToday - checkedOutToday
      },
      subscription: {
        plan: company.subscription_plan,
        status: company.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get company branding (logo, name) - Public endpoint for login page
 * @route   GET /api/company/branding/:tenantId
 * @access  Public
 */
const getCompanyBranding = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const company = await Company.findOne({
      company_id: tenantId.toUpperCase()
    }).select('company_name logo domain');

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    successResponse(res, 200, {
      name: company.company_name,
      logo: company.logo || null,
      domain: company.domain
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
  updateCompanySettings,
  getCompanyStats,
  getCompanyBranding
};
