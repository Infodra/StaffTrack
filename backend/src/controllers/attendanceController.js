const { processLogin, processLogout, getAttendanceHistory } = require('../services/attendanceService');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    Login with GPS location
 * @route   POST /api/attendance/login
 * @access  Private
 */
const login = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const attendance = await processLogin(
      req.user,
      req.company,
      latitude,
      longitude
    );

    successResponse(res, 201, {
      attendance_id: attendance._id,
      check_in_time: attendance.check_in.time,
      date: attendance.date,
      status: attendance.status
    }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout with GPS location
 * @route   POST /api/attendance/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const attendance = await processLogout(
      req.user,
      req.company,
      latitude,
      longitude
    );

    successResponse(res, 200, {
      attendance_id: attendance._id,
      check_in_time: attendance.check_in.time,
      check_out_time: attendance.check_out.time,
      working_hours: attendance.working_hours,
      date: attendance.date,
      status: attendance.status
    }, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance history
 * @route   GET /api/attendance/history
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 30, employee_id } = req.query;

    // Employees can only view their own history
    // Admins can view any employee's history
    let targetEmployeeId = req.user._id;

    if (employee_id && req.user.role === 'admin') {
      targetEmployeeId = employee_id;
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const result = await getAttendanceHistory(
      req.company.company_id,
      targetEmployeeId,
      start,
      end,
      parseInt(page),
      parseInt(limit)
    );

    successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's attendance status
 * @route   GET /api/attendance/today
 * @access  Private
 */
const getTodayStatus = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      company_id: req.company.company_id,
      employee_id: req.user._id,
      date: today
    });

    if (!attendance) {
      return successResponse(res, 200, {
        status: 'not-checked-in',
        message: 'You have not checked in today'
      });
    }

    const data = {
      attendance_id: attendance._id,
      date: attendance.date,
      check_in_time: attendance.check_in.time,
      check_out_time: attendance.check_out?.time || null,
      working_hours: attendance.working_hours,
      status: attendance.check_out?.time ? 'checked-out' : 'checked-in'
    };

    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance report for company (Admin only)
 * @route   GET /api/attendance/report
 * @access  Private (Admin only)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of current month
    const end = endDate ? new Date(endDate) : new Date(); // Today

    // Build aggregation pipeline
    const matchStage = {
      company_id: req.company.company_id,
      date: { $gte: start, $lte: end }
    };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ];

    // Filter by department if specified
    if (department) {
      pipeline.push({
        $match: { 'employee.department': department }
      });
    }

    // Group by employee
    pipeline.push({
      $group: {
        _id: '$employee_id',
        employee_name: { $first: '$employee.name' },
        employee_email: { $first: '$employee.email' },
        department: { $first: '$employee.department' },
        total_days: { $sum: 1 },
        present_days: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        total_working_hours: { $sum: '$working_hours' },
        average_working_hours: { $avg: '$working_hours' }
      }
    });

    const report = await Attendance.aggregate(pipeline);

    successResponse(res, 200, {
      period: {
        start_date: start,
        end_date: end
      },
      report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getHistory,
  getTodayStatus,
  getAttendanceReport
};
