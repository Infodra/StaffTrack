const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  getHistory,
  getTodayStatus,
  getAttendanceReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const {
  attendanceLocationValidation,
  attendanceHistoryValidation
} = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Login
router.post('/login', attendanceLocationValidation, login);

// Logout
router.post('/logout', attendanceLocationValidation, logout);

// Get attendance history
router.get('/history', attendanceHistoryValidation, getHistory);

// Get today's attendance status
router.get('/today', getTodayStatus);

// Get attendance report (Admin only)
router.get('/report', authorize('admin'), getAttendanceReport);

module.exports = router;
