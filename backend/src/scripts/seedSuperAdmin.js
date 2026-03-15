/**
 * Seed script to create the Infodra super admin
 * Run: node src/scripts/seedSuperAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const Company = require('../models/Company');
const Employee = require('../models/Employee');

const SUPER_ADMIN_CONFIG = {
  company: {
    company_id: 'INFODRA',
    company_name: 'Infodra Technologies',
    admin_email: 'connect@infodra.ai',
    domain: 'stafftrack.infodra.ai',
    employee_limit: 10000,
    license_type: 'lifetime',
    office_location: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    geofence_radius: 200,
    status: 'active'
  },
  admin: {
    employee_id: 'INFODRA-SUPERADMIN',
    company_id: 'INFODRA',
    name: 'Infodra Admin',
    email: 'connect@infodra.ai',
    password: 'Admin@123',
    role: 'super_admin',
    latitude: 12.9716,
    longitude: 77.5946,
    radius_meters: 200
  }
};

const seedSuperAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin company already exists
    const existingCompany = await Company.findOne({ company_id: SUPER_ADMIN_CONFIG.company.company_id });
    if (existingCompany) {
      console.log('Infodra company already exists. Checking super admin...');
    } else {
      // Create Infodra company
      await Company.create(SUPER_ADMIN_CONFIG.company);
      console.log('Created Infodra company');
    }

    // Check if super admin user already exists
    const existingAdmin = await Employee.findOne({ email: SUPER_ADMIN_CONFIG.admin.email });
    if (existingAdmin) {
      // Update role to super_admin if not already
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        await existingAdmin.save();
        console.log('Updated existing admin to super_admin role');
      } else {
        console.log('Super admin already exists');
      }
    } else {
      // Create super admin
      await Employee.create(SUPER_ADMIN_CONFIG.admin);
      console.log('Created super admin user');
    }

    console.log('\n========================================');
    console.log('  SUPER ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`  Email:    ${SUPER_ADMIN_CONFIG.admin.email}`);
    console.log(`  Password: ${SUPER_ADMIN_CONFIG.admin.password}`);
    console.log(`  Role:     super_admin`);
    console.log(`  Company:  ${SUPER_ADMIN_CONFIG.company.company_name}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
