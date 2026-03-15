const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/leave/apply
 * @desc    Apply for leave
 * @access  Private (Employee)
 */
router.post('/apply', leaveController.applyLeave);

/**
 * @route   GET /api/leave/requests
 * @desc    Get leave requests (Employee: own, Admin: all)
 * @access  Private
 */
router.get('/requests', leaveController.getLeaveRequests);

/**
 * @route   GET /api/leave/balance
 * @desc    Get leave balance
 * @access  Private (Employee)
 */
router.get('/balance', leaveController.getLeaveBalance);

/**
 * @route   PUT /api/leave/:id/status
 * @desc    Update leave status (approve/reject)
 * @access  Private (Admin)
 */
router.put('/:id/status', authorize('admin'), leaveController.updateLeaveStatus);

/**
 * @route   DELETE /api/leave/:id
 * @desc    Delete leave request
 * @access  Private
 */
router.delete('/:id', leaveController.deleteLeaveRequest);

/**
 * @route   GET /api/leave/statistics
 * @desc    Get leave statistics
 * @access  Private (Admin)
 */
router.get('/statistics', authorize('admin'), leaveController.getLeaveStatistics);

/**
 * @route   GET /api/leave/export
 * @desc    Export leave data as Excel
 * @access  Private (Admin)
 */
router.get('/export', authorize('admin'), leaveController.exportLeaveExcel);

module.exports = router;
