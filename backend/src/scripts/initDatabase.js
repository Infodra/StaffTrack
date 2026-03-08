/**
 * Database Initialization Script
 * Creates sample data for testing the GPS Attendance System
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LocationLog = require('../models/LocationLog');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log('📦 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await Company.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await LocationLog.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  }
};

// Create sample data
const createSampleData = async () => {
  try {
    // 1. Create Companies
    console.log('\n📋 Creating Companies...');
    
    const company1 = await Company.create({
      company_id: 'TEC001',
      company_name: 'Tecinfo',
      admin_email: 'admin@tecinfo.com',
      employee_limit: 50,
      license_type: 'lifetime',
      status: 'active'
    });
    console.log('✓ Created company:', company1.company_name);

    const company2 = await Company.create({
      company_id: 'INFOD001',
      company_name: 'Infodra Technologies',
      admin_email: 'admin@infodra.com',
      employee_limit: 100,
      license_type: 'lifetime',
      status: 'active'
    });
    console.log('✓ Created company:', company2.company_name);

    // 2. Create Employees
    console.log('\n👥 Creating Employees...');

    // Use plain password - Employee model will hash it automatically
    const plainPassword = 'password123';

    // Admin for Tecinfo
    const admin1 = await Employee.create({
      employee_id: 'EMP001',
      company_id: 'TEC001',
      name: 'Raj Kumar',
      email: 'raj@tecinfo.com',
      password: plainPassword,
      role: 'admin',
      department: 'Management',
      status: 'active',
      location_name: 'Tecinfo Office',
      latitude: 13.0827,
      longitude: 80.2707,
      radius_meters: 150
    });
    console.log('✓ Created admin:', admin1.name);

    // Field employee for Tecinfo
    const employee1 = await Employee.create({
      employee_id: 'EMP002',
      company_id: 'TEC001',
      name: 'Priya Sharma',
      email: 'priya@tecinfo.com',
      password: plainPassword,
      role: 'employee',
      department: 'Field Service',
      status: 'active',
      location_name: 'Client Office A',
      latitude: 13.0850,
      longitude: 80.2750,
      radius_meters: 100
    });
    console.log('✓ Created employee:', employee1.name);

    // Admin for Infodra
    const admin2 = await Employee.create({
      employee_id: 'EMP003',
      company_id: 'INFOD001',
      name: 'Vijay Kumar',
      email: 'vijay@infodra.com',
      password: plainPassword,
      role: 'admin',
      department: 'Management',
      status: 'active',
      location_name: 'Infodra Head Office',
      latitude: 12.9716,
      longitude: 77.5946,
      radius_meters: 200
    });
    console.log('✓ Created admin:', admin2.name);

    // Employee for Infodra
    const employee2 = await Employee.create({
      employee_id: 'EMP004',
      company_id: 'INFOD001',
      name: 'Lakshmi Devi',
      email: 'lakshmi@infodra.com',
      password: plainPassword,
      role: 'employee',
      department: 'Development',
      status: 'active',
      location_name: 'Infodra Development Center',
      latitude: 12.9750,
      longitude: 77.6000,
      radius_meters: 150
    });
    console.log('✓ Created employee:', employee2.name);

    // 3. Create Attendance Records
    console.log('\n📅 Creating Attendance Records...');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const checkInTime = new Date(today);
    checkInTime.setHours(9, 2, 0, 0);
    
    const checkOutTime = new Date(today);
    checkOutTime.setHours(18, 10, 0, 0);

    const attendance1 = await Attendance.create({
      attendance_id: 'ATT001',
      company_id: 'TEC001',
      employee_id: 'EMP001',
      date: todayStr,
      check_in: checkInTime,
      check_out: checkOutTime,
      working_hours: 9,
      status: 'present'
    });
    console.log('✓ Created attendance for:', admin1.name);

    const attendance2 = await Attendance.create({
      attendance_id: 'ATT002',
      company_id: 'TEC001',
      employee_id: 'EMP002',
      date: todayStr,
      check_in: new Date(today.setHours(9, 15, 0, 0)),
      check_out: new Date(today.setHours(17, 45, 0, 0)),
      working_hours: 8.5,
      status: 'present'
    });
    console.log('✓ Created attendance for:', employee1.name);

    // 4. Create Location Logs
    console.log('\n📍 Creating Location Logs...');

    await LocationLog.create({
      company_id: 'TEC001',
      employee_id: 'EMP001',
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 10,
      timestamp: checkInTime
    });

    await LocationLog.create({
      company_id: 'TEC001',
      employee_id: 'EMP002',
      latitude: 13.0850,
      longitude: 80.2750,
      accuracy: 15,
      timestamp: new Date()
    });

    console.log('✓ Created location logs');

    console.log('\n✅ Sample data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    throw error;
  }
};

// Display database statistics
const displayStats = async () => {
  try {
    const companyCount = await Company.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    const locationLogCount = await LocationLog.countDocuments();

    console.log('\n📊 DATABASE STATISTICS');
    console.log('═══════════════════════');
    console.log(`Companies:      ${companyCount}`);
    console.log(`Employees:      ${employeeCount}`);
    console.log(`Attendance:     ${attendanceCount}`);
    console.log(`Location Logs:  ${locationLogCount}`);
    console.log('═══════════════════════');

    // Display sample data
    console.log('\n🏢 SAMPLE COMPANIES:');
    const companies = await Company.find();
    companies.forEach(company => {
      console.log(`  • ${company.company_id} - ${company.company_name}`);
      console.log(`    Admin: ${company.admin_email}`);
      console.log(`    License: ${company.license_type} (${company.employee_limit} employees)`);
    });

    console.log('\n👤 SAMPLE EMPLOYEES:');
    const employees = await Employee.find();
    employees.forEach(employee => {
      console.log(`  • ${employee.employee_id} - ${employee.name} (${employee.role})`);
      console.log(`    Company: ${employee.company_id}`);
      console.log(`    Location: ${employee.location_name}`);
      console.log(`    Geofence: ${employee.latitude}, ${employee.longitude} (${employee.radius_meters}m)`);
    });

    console.log('\n📅 SAMPLE ATTENDANCE:');
    const attendances = await Attendance.find();
    attendances.forEach(attendance => {
      console.log(`  • ${attendance.attendance_id} - Employee: ${attendance.employee_id}`);
      console.log(`    Date: ${attendance.date}`);
      console.log(`    Hours: ${attendance.working_hours}h - Status: ${attendance.status}`);
    });

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('─────────────────────');
    console.log('Email: raj@tecinfo.com');
    console.log('Password: password123');
    console.log('Role: admin');
    console.log('─────────────────────');
    console.log('Email: priya@tecinfo.com');
    console.log('Password: password123');
    console.log('Role: employee');
    console.log('─────────────────────');

  } catch (error) {
    console.error('Error displaying stats:', error.message);
  }
};

// Main function
const initDatabase = async () => {
  try {
    console.log('🚀 Starting Database Initialization...\n');
    
    await connectDB();
    await clearDatabase();
    await createSampleData();
    await displayStats();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('🎉 You can now start the backend server and test the application\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
