const Attendance = require('../models/Attendance');
const LocationLog = require('../models/LocationLog');
const { checkGeofence, validateCoordinates } = require('./gpsService');

/**
 * Process login
 * @param {Object} employee - Employee object
 * @param {Object} company - Company object
 * @param {Number} latitude - Login latitude
 * @param {Number} longitude - Login longitude
 * @returns {Object} Attendance record
 */
const processLogin = async (employee, company, latitude, longitude, accuracy) => {
  // Validate coordinates
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid GPS coordinates');
  }

  // Use employee-level geofence if available, otherwise fall back to company
  const officeLat = employee.latitude || company.office_location.latitude;
  const officeLon = employee.longitude || company.office_location.longitude;
  const radius = employee.radius_meters || company.geofence_radius || 150;

  // Check geofence
  const geofenceResult = checkGeofence(
    latitude,
    longitude,
    officeLat,
    officeLon,
    radius
  );

  if (!geofenceResult.isWithinGeofence) {
    throw new Error(
      `You are ${geofenceResult.distance}m away from the office. Please move within ${radius}m radius to login.`
    );
  }

  // Get today's date as string (YYYY-MM-DD)
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Check if already logged in today
  const existingAttendance = await Attendance.findOne({
    company_id: employee.company_id,
    employee_id: employee.employee_id,
    date: dateStr
  });

  if (existingAttendance) {
    throw new Error('You have already logged in today');
  }

  // Generate attendance ID
  const attendanceId = `${employee.company_id}-${employee.employee_id}-${dateStr}`;

  // Create attendance record
  const attendance = await Attendance.create({
    attendance_id: attendanceId,
    company_id: employee.company_id,
    employee_id: employee.employee_id,
    date: dateStr,
    check_in: new Date(),
    status: 'present'
  });

  // Log location
  await LocationLog.create({
    company_id: employee.company_id,
    employee_id: employee.employee_id,
    timestamp: new Date(),
    latitude,
    longitude,
    accuracy: accuracy || null
  });

  return attendance;
};

/**
 * Process logout
 * @param {Object} employee - Employee object
 * @param {Object} company - Company object
 * @param {Number} latitude - Logout latitude
 * @param {Number} longitude - Logout longitude
 * @returns {Object} Updated attendance record
 */
const processLogout = async (employee, company, latitude, longitude, accuracy) => {
  // Validate coordinates
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid GPS coordinates');
  }

  // Use employee-level geofence if available, otherwise fall back to company
  const officeLat = employee.latitude || company.office_location.latitude;
  const officeLon = employee.longitude || company.office_location.longitude;
  const radius = employee.radius_meters || company.geofence_radius || 150;

  // Check geofence
  const geofenceResult = checkGeofence(
    latitude,
    longitude,
    officeLat,
    officeLon,
    radius
  );

  if (!geofenceResult.isWithinGeofence) {
    throw new Error(
      `You are ${geofenceResult.distance}m away from the office. Please move within ${radius}m radius to logout.`
    );
  }

  // Get today's date as string (YYYY-MM-DD)
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Find today's attendance
  const attendance = await Attendance.findOne({
    company_id: employee.company_id,
    employee_id: employee.employee_id,
    date: dateStr
  });

  if (!attendance) {
    throw new Error('No login record found for today. Please login first.');
  }

  if (attendance.check_out) {
    throw new Error('You have already logged out today');
  }

  // Update attendance with logout
  attendance.check_out = new Date();

  await attendance.save();

  // Log location
  await LocationLog.create({
    company_id: employee.company_id,
    employee_id: employee.employee_id,
    timestamp: new Date(),
    latitude,
    longitude,
    accuracy: accuracy || null
  });

  return attendance;
};

/**
 * Get attendance history for an employee
 * @param {String} companyId - Company ID
 * @param {String} employeeId - Employee ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @param {Number} page - Page number
 * @param {Number} limit - Records per page
 * @returns {Object} Attendance records with pagination
 */
const getAttendanceHistory = async (companyId, employeeId, startDate, endDate, page = 1, limit = 30) => {
  const query = {
    company_id: companyId
  };

  if (employeeId) {
    query.employee_id = employeeId;
  }

  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = startDate;
    }
    if (endDate) {
      query.date.$lte = endDate;
    }
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(query)
  ]);

  return {
    records,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

module.exports = {
  processLogin,
  processLogout,
  getAttendanceHistory
};
