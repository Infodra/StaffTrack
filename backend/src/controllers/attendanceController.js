const { processLogin, processLogout, getAttendanceHistory } = require('../services/attendanceService');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const ExcelJS = require('exceljs');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    Login with GPS location
 * @route   POST /api/attendance/login
 * @access  Private
 */
const login = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    const attendance = await processLogin(
      req.user,
      req.company,
      latitude,
      longitude,
      accuracy
    );

    successResponse(res, 201, {
      attendance_id: attendance._id,
      check_in_time: attendance.check_in,
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
    const { latitude, longitude, accuracy } = req.body;

    const attendance = await processLogout(
      req.user,
      req.company,
      latitude,
      longitude,
      accuracy
    );

    successResponse(res, 200, {
      attendance_id: attendance._id,
      check_in_time: attendance.check_in,
      check_out_time: attendance.check_out,
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
    // Admins can view any employee's history or all employees
    let targetEmployeeId = req.user.employee_id;

    if (req.user.role === 'admin') {
      if (employee_id) {
        // Admin filtering by specific employee — look up their employee_id string
        const emp = await Employee.findById(employee_id);
        targetEmployeeId = emp ? emp.employee_id : employee_id;
      } else {
        targetEmployeeId = null; // null = all employees
      }
    }

    const start = startDate || null;
    const end = endDate || null;

    const result = await getAttendanceHistory(
      req.company.company_id,
      targetEmployeeId,
      start,
      end,
      parseInt(page),
      parseInt(limit)
    );

    // Enrich records with employee info for admin view
    if (req.user.role === 'admin' && result.records.length > 0) {
      const empIds = [...new Set(result.records.map(r => r.employee_id))];
      const employees = await Employee.find({ employee_id: { $in: empIds } }).select('employee_id name email department').lean();
      const empLookup = {};
      employees.forEach(e => { empLookup[e.employee_id] = e; });
      result.records = result.records.map(r => ({
        ...r,
        employee_id: empLookup[r.employee_id] || { name: r.employee_id, department: '' }
      }));
    }

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
    const dateStr = today.toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      company_id: req.user.company_id,
      employee_id: req.user.employee_id,
      date: dateStr
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
      check_in_time: attendance.check_in,
      check_out_time: attendance.check_out || null,
      working_hours: attendance.working_hours,
      status: attendance.check_out ? 'checked-out' : 'checked-in'
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

    const start = startDate || new Date(new Date().setDate(1)).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Build aggregation pipeline - date is stored as YYYY-MM-DD string
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
          foreignField: 'employee_id',
          as: 'employee'
        }
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
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

/**
 * @desc    Admin: Update an employee's attendance (missed login/logout)
 * @route   PUT /api/attendance/:id
 * @access  Private (Admin only)
 */
const adminUpdateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, status } = req.body;

    const attendance = await Attendance.findOne({
      _id: id,
      company_id: req.company.company_id
    });

    if (!attendance) {
      return errorResponse(res, 404, 'Attendance record not found');
    }

    if (check_in) {
      attendance.check_in = new Date(check_in);
    }

    if (check_out) {
      attendance.check_out = new Date(check_out);
    }

    if (status) {
      attendance.status = status;
    }

    // Recalculate working hours
    if (attendance.check_in && attendance.check_out) {
      const diff = new Date(attendance.check_out) - new Date(attendance.check_in);
      attendance.working_hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    }

    await attendance.save();

    successResponse(res, 200, attendance, 'Attendance updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Create attendance record for an employee (missed day)
 * @route   POST /api/attendance/admin-create
 * @access  Private (Admin only)
 */
const adminCreateAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;

    // Verify employee belongs to this company
    const employee = await Employee.findOne({
      _id: employee_id,
      company_id: req.company.company_id
    });

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Check for existing record
    const existing = await Attendance.findOne({
      company_id: req.company.company_id,
      employee_id: employee.employee_id,
      date: dateStr
    });

    if (existing) {
      return errorResponse(res, 400, 'Attendance record already exists for this date. Use edit instead.');
    }

    const checkInTime = new Date(check_in);
    const checkOutTime = check_out ? new Date(check_out) : null;
    let workingHours = 0;

    if (checkInTime && checkOutTime) {
      const diff = checkOutTime - checkInTime;
      workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    }

    const attendance = await Attendance.create({
      attendance_id: `${req.company.company_id}-${employee.employee_id}-${dateStr}`,
      company_id: req.company.company_id,
      employee_id: employee.employee_id,
      date: dateStr,
      check_in: checkInTime,
      check_out: checkOutTime,
      working_hours: workingHours,
      status: status || 'present'
    });

    successResponse(res, 201, attendance, 'Attendance record created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export attendance data as Excel
 * @route   GET /api/attendance/export
 * @access  Private (Admin only)
 */
const exportAttendanceExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, employee_id } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const matchStage = {
      company_id: req.company.company_id,
      date: { $gte: start, $lte: end }
    };

    if (employee_id) {
      const mongoose = require('mongoose');
      matchStage.employee_id = new mongoose.Types.ObjectId(employee_id);
    }

    const records = await Attendance.find(matchStage)
      .populate('employee_id', 'name email department employee_id')
      .sort({ date: -1, employee_id: 1 })
      .lean();

    // Also fetch leave data for the period
    const Leave = require('../models/Leave');
    const leaveMatch = {
      company_id: req.company.company_id,
      status: 'approved',
      start_date: { $lte: end },
      end_date: { $gte: start }
    };
    if (employee_id) {
      leaveMatch.employee_id = employee_id;
    }
    const leaves = await Leave.find(leaveMatch).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StaffTracker';
    workbook.created = new Date();

    // --- Sheet 1: Daily Attendance ---
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee ID', key: 'emp_id', width: 15 },
      { header: 'Employee Name', key: 'name', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Check In', key: 'check_in', width: 20 },
      { header: 'Check Out', key: 'check_out', width: 20 },
      { header: 'Working Hours', key: 'working_hours', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    records.forEach(record => {
      const emp = record.employee_id || {};
      sheet.addRow({
        date: record.date ? new Date(record.date).toLocaleDateString('en-IN') : '',
        emp_id: emp.employee_id || '',
        name: emp.name || '',
        email: emp.email || '',
        department: emp.department || '',
        check_in: record.check_in ? new Date(record.check_in).toLocaleString('en-IN') : '-',
        check_out: record.check_out ? new Date(record.check_out).toLocaleString('en-IN') : '-',
        working_hours: record.working_hours ? record.working_hours.toFixed(2) : '0.00',
        status: record.status || ''
      });
    });

    // --- Sheet 2: Summary ---
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Employee Name', key: 'name', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Total Days Present', key: 'present', width: 18 },
      { header: 'Total Working Hours', key: 'total_hours', width: 20 },
      { header: 'Avg Hours/Day', key: 'avg_hours', width: 15 },
      { header: 'Leaves Taken', key: 'leaves', width: 14 }
    ];

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Group by employee
    const empMap = {};
    records.forEach(r => {
      const emp = r.employee_id || {};
      const key = emp._id?.toString() || r.employee_id;
      if (!empMap[key]) {
        empMap[key] = { name: emp.name, email: emp.email, department: emp.department, days: 0, hours: 0 };
      }
      empMap[key].days++;
      empMap[key].hours += r.working_hours || 0;
    });

    // Count leaves per employee
    const leaveMap = {};
    leaves.forEach(l => {
      const key = l.employee_id?.toString();
      leaveMap[key] = (leaveMap[key] || 0) + l.days_count;
    });

    Object.entries(empMap).forEach(([id, data]) => {
      summarySheet.addRow({
        name: data.name,
        email: data.email,
        department: data.department,
        present: data.days,
        total_hours: data.hours.toFixed(2),
        avg_hours: data.days > 0 ? (data.hours / data.days).toFixed(2) : '0.00',
        leaves: leaveMap[id] || 0
      });
    });

    // --- Sheet 3: Leaves ---
    const leaveSheet = workbook.addWorksheet('Leaves');
    leaveSheet.columns = [
      { header: 'Employee Name', key: 'name', width: 22 },
      { header: 'Leave Type', key: 'type', width: 15 },
      { header: 'Start Date', key: 'start', width: 15 },
      { header: 'End Date', key: 'end', width: 15 },
      { header: 'Days', key: 'days', width: 8 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Reason', key: 'reason', width: 35 }
    ];

    leaveSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    leaveSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    leaves.forEach(l => {
      leaveSheet.addRow({
        name: l.employee_name,
        type: l.leave_type,
        start: new Date(l.start_date).toLocaleDateString('en-IN'),
        end: new Date(l.end_date).toLocaleDateString('en-IN'),
        days: l.days_count,
        status: l.status,
        reason: l.reason
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getHistory,
  getTodayStatus,
  getAttendanceReport,
  adminUpdateAttendance,
  adminCreateAttendance,
  exportAttendanceExcel
};
