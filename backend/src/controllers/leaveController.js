const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
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
      return errorResponse(res, 'Start date cannot be after end date', 400);
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
      return errorResponse(res, 'You already have a leave request for this period', 400);
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

    successResponse(res, 'Leave request submitted successfully', leave, 201);
  } catch (error) {
    console.error('Apply leave error:', error);
    errorResponse(res, 'Failed to submit leave request', 500);
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

    successResponse(res, 'Leave requests retrieved successfully', { 
      leaves,
      count: leaves.length 
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    errorResponse(res, 'Failed to retrieve leave requests', 500);
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

    successResponse(res, 'Leave balance retrieved successfully', {
      allocation,
      used: usedDays,
      balance,
      year: currentYear
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    errorResponse(res, 'Failed to retrieve leave balance', 500);
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
      return errorResponse(res, 'Invalid status', 400);
    }

    const leave = await Leave.findOne({
      _id: id,
      company_id: companyId
    });

    if (!leave) {
      return errorResponse(res, 'Leave request not found', 404);
    }

    if (leave.status !== 'pending') {
      return errorResponse(res, 'Leave request already processed', 400);
    }

    leave.status = status;
    leave.reviewed_by = req.user.id;
    leave.reviewed_at = new Date();
    leave.admin_remarks = admin_remarks;

    await leave.save();

    await leave.populate('reviewed_by', 'name email');

    successResponse(res, `Leave request ${status} successfully`, leave);
  } catch (error) {
    console.error('Update leave status error:', error);
    errorResponse(res, 'Failed to update leave request', 500);
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
      return errorResponse(res, 'Leave request not found or cannot be deleted', 404);
    }

    successResponse(res, 'Leave request deleted successfully');
  } catch (error) {
    console.error('Delete leave request error:', error);
    errorResponse(res, 'Failed to delete leave request', 500);
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

    successResponse(res, 'Leave statistics retrieved successfully', {
      by_status: stats,
      by_type: typeStats,
      year: currentYear
    });
  } catch (error) {
    console.error('Get leave statistics error:', error);
    errorResponse(res, 'Failed to retrieve leave statistics', 500);
  }
};
