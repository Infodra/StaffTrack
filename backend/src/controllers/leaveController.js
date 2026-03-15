const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const ExcelJS = require('exceljs');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Apply for leave (Employee)
 */
exports.applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employeeId = req.user.id;
    const companyId = req.user.company_id;

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate > endDate) {
      return errorResponse(res, 400, 'Start date cannot be after end date');
    }

    // Calculate days (including start and end date)
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      company_id: companyId,
      employee_id: employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } }
      ]
    });

    if (overlappingLeave) {
      return errorResponse(res, 400, 'You already have a leave request for this period');
    }

    // Create leave request
    const leave = new Leave({
      company_id: companyId,
      employee_id: employeeId,
      employee_name: req.user.name,
      employee_email: req.user.email,
      leave_type,
      start_date: startDate,
      end_date: endDate,
      days_count: daysCount,
      reason,
      status: 'pending'
    });

    await leave.save();

    successResponse(res, 201, leave, 'Leave request submitted successfully');
  } catch (error) {
    console.error('Apply leave error:', error);
    errorResponse(res, 500, 'Failed to submit leave request');
  }
};

/**
 * Get leave requests (Employee - their own, Admin - all)
 */
exports.getLeaveRequests = async (req, res) => {
  try {
    const { status, start_date, end_date, employee_id } = req.query;
    const companyId = req.user.company_id;
    const isAdmin = req.user.role === 'admin';

    let query = { company_id: companyId };

    // Non-admin users can only see their own leaves
    if (!isAdmin) {
      query.employee_id = req.user.id;
    } else if (employee_id) {
      query.employee_id = employee_id;
    }

    if (status) {
      query.status = status;
    }

    if (start_date && end_date) {
      query.$or = [
        { 
          start_date: { 
            $gte: new Date(start_date), 
            $lte: new Date(end_date) 
          } 
        },
        { 
          end_date: { 
            $gte: new Date(start_date), 
            $lte: new Date(end_date) 
          } 
        }
      ];
    }

    const leaves = await Leave.find(query)
      .populate('reviewed_by', 'name email')
      .sort({ created_at: -1 });

    successResponse(res, 200, { 
      leaves,
      count: leaves.length 
    }, 'Leave requests retrieved successfully');
  } catch (error) {
    console.error('Get leave requests error:', error);
    errorResponse(res, 500, 'Failed to retrieve leave requests');
  }
};

/**
 * Get leave balance (Employee)
 */
exports.getLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.company_id;
    const currentYear = new Date().getFullYear();

    // Get all approved leaves for current year
    const approvedLeaves = await Leave.find({
      company_id: companyId,
      employee_id: employeeId,
      status: 'approved',
      start_date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    // Calculate used days by type
    const usedDays = {
      sick: 0,
      casual: 0,
      annual: 0,
      permission: 0,
      other: 0
    };

    approvedLeaves.forEach(leave => {
      usedDays[leave.leave_type] += leave.days_count;
    });

    // Standard leave allocations (can be made configurable per company)
    const allocation = {
      sick: 12,
      casual: 12,
      annual: 18,
      permission: 5,
      other: 5
    };

    const balance = {
      sick: allocation.sick - usedDays.sick,
      casual: allocation.casual - usedDays.casual,
      annual: allocation.annual - usedDays.annual,
      permission: allocation.permission - usedDays.permission,
      other: allocation.other - usedDays.other
    };

    successResponse(res, 200, {
      allocation,
      used: usedDays,
      balance,
      year: currentYear
    }, 'Leave balance retrieved successfully');
  } catch (error) {
    console.error('Get leave balance error:', error);
    errorResponse(res, 500, 'Failed to retrieve leave balance');
  }
};

/**
 * Update leave status (Admin only)
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;
    const companyId = req.user.company_id;

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status');
    }

    const leave = await Leave.findOne({
      _id: id,
      company_id: companyId
    });

    if (!leave) {
      return errorResponse(res, 404, 'Leave request not found');
    }

    if (leave.status !== 'pending') {
      return errorResponse(res, 400, 'Leave request already processed');
    }

    leave.status = status;
    leave.reviewed_by = req.user.id;
    leave.reviewed_at = new Date();
    leave.admin_remarks = admin_remarks;

    await leave.save();

    await leave.populate('reviewed_by', 'name email');

    successResponse(res, 200, leave, `Leave request ${status} successfully`);
  } catch (error) {
    console.error('Update leave status error:', error);
    errorResponse(res, 500, 'Failed to update leave request');
  }
};

/**
 * Delete leave request (Employee - only pending, Admin - any)
 */
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;
    const isAdmin = req.user.role === 'admin';

    let query = {
      _id: id,
      company_id: companyId
    };

    // Non-admin can only delete their own pending leaves
    if (!isAdmin) {
      query.employee_id = req.user.id;
      query.status = 'pending';
    }

    const leave = await Leave.findOneAndDelete(query);

    if (!leave) {
      return errorResponse(res, 404, 'Leave request not found or cannot be deleted');
    }

    successResponse(res, 200, null, 'Leave request deleted successfully');
  } catch (error) {
    console.error('Delete leave request error:', error);
    errorResponse(res, 500, 'Failed to delete leave request');
  }
};

/**
 * Get leave statistics (Admin)
 */
exports.getLeaveStatistics = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const currentYear = new Date().getFullYear();

    const stats = await Leave.aggregate([
      {
        $match: {
          company_id: companyId,
          start_date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_days: { $sum: '$days_count' }
        }
      }
    ]);

    const typeStats = await Leave.aggregate([
      {
        $match: {
          company_id: companyId,
          status: 'approved',
          start_date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: '$leave_type',
          count: { $sum: 1 },
          total_days: { $sum: '$days_count' }
        }
      }
    ]);

    successResponse(res, 200, {
      by_status: stats,
      by_type: typeStats,
      year: currentYear
    }, 'Leave statistics retrieved successfully');
  } catch (error) {
    console.error('Get leave statistics error:', error);
    errorResponse(res, 500, 'Failed to retrieve leave statistics');
  }
};

/**
 * Export leave data as Excel (Admin)
 */
exports.exportLeaveExcel = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { status, leave_type, startDate, endDate } = req.query;

    const query = { company_id: companyId };
    if (status && status !== 'all') query.status = status;
    if (leave_type) query.leave_type = leave_type;
    if (startDate || endDate) {
      query.start_date = {};
      if (startDate) query.start_date.$gte = new Date(startDate);
      if (endDate) query.start_date.$lte = new Date(endDate);
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Attendance System';

    // Sheet 1: Leave Requests
    const sheet = workbook.addWorksheet('Leave Requests');
    sheet.columns = [
      { header: 'Employee Name', key: 'employee_name', width: 25 },
      { header: 'Email', key: 'employee_email', width: 30 },
      { header: 'Leave Type', key: 'leave_type', width: 15 },
      { header: 'Start Date', key: 'start_date', width: 15 },
      { header: 'End Date', key: 'end_date', width: 15 },
      { header: 'Days', key: 'days_count', width: 8 },
      { header: 'Reason', key: 'reason', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Admin Remarks', key: 'admin_remarks', width: 30 },
      { header: 'Applied On', key: 'applied_on', width: 15 }
    ];

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B0082' } };

    const typeLabels = { sick: 'Sick Leave', casual: 'Casual Leave', annual: 'Privilege Leave', permission: 'Permission', other: 'Other' };

    leaves.forEach(leave => {
      const row = sheet.addRow({
        employee_name: leave.employee_name || '',
        employee_email: leave.employee_email || '',
        leave_type: typeLabels[leave.leave_type] || leave.leave_type,
        start_date: leave.start_date ? new Date(leave.start_date).toLocaleDateString() : '',
        end_date: leave.end_date ? new Date(leave.end_date).toLocaleDateString() : '',
        days_count: leave.days_count || 0,
        reason: leave.reason || '',
        status: leave.status ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1) : '',
        admin_remarks: leave.admin_remarks || '',
        applied_on: leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : ''
      });

      // Color-code status
      const statusCell = row.getCell('status');
      if (leave.status === 'approved') {
        statusCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (leave.status === 'rejected') {
        statusCell.font = { color: { argb: 'FFCC0000' }, bold: true };
      } else if (leave.status === 'pending') {
        statusCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
      }
    });

    // Sheet 2: Summary by Employee
    const summarySheet = workbook.addWorksheet('Employee Summary');
    summarySheet.columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Total Requests', key: 'total', width: 15 },
      { header: 'Approved', key: 'approved', width: 12 },
      { header: 'Rejected', key: 'rejected', width: 12 },
      { header: 'Pending', key: 'pending', width: 12 },
      { header: 'Total Days (Approved)', key: 'total_days', width: 20 }
    ];

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E8B57' } };

    // Group by employee
    const employeeMap = {};
    leaves.forEach(l => {
      const key = l.employee_email || 'unknown';
      if (!employeeMap[key]) {
        employeeMap[key] = { name: l.employee_name, email: l.employee_email, total: 0, approved: 0, rejected: 0, pending: 0, total_days: 0 };
      }
      employeeMap[key].total++;
      if (l.status === 'approved') { employeeMap[key].approved++; employeeMap[key].total_days += l.days_count || 0; }
      else if (l.status === 'rejected') employeeMap[key].rejected++;
      else if (l.status === 'pending') employeeMap[key].pending++;
    });

    Object.values(employeeMap).forEach(emp => summarySheet.addRow(emp));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leave_report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export leave Excel error:', error);
    errorResponse(res, 500, 'Failed to export leave data');
  }
};
