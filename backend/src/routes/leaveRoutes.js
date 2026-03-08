const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/leave/apply
 * @desc    Apply for leave
 * @access  Private (Employee)
 */
router.post('/apply', auth, leaveController.applyLeave);

/**
 * @route   GET /api/leave/requests
 * @desc    Get leave requests (Employee: own, Admin: all)
 * @access  Private
 */
router.get('/requests', auth, leaveController.getLeaveRequests);

/**
 * @route   GET /api/leave/balance
 * @desc    Get leave balance
 * @access  Private (Employee)
 */
router.get('/balance', auth, leaveController.getLeaveBalance);

/**
 * @route   PUT /api/leave/:id/status
 * @desc    Update leave status (approve/reject)
 * @access  Private (Admin)
 */
router.put('/:id/status', auth, leaveController.updateLeaveStatus);

/**
 * @route   DELETE /api/leave/:id
 * @desc    Delete leave request
 * @access  Private
 */
router.delete('/:id', auth, leaveController.deleteLeaveRequest);

/**
 * @route   GET /api/leave/statistics
 * @desc    Get leave statistics
 * @access  Private (Admin)
 */
router.get('/statistics', auth, leaveController.getLeaveStatistics);

module.exports = router;
