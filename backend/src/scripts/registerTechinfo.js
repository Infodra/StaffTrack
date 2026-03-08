/**
 * Register Techinfo Company
 * Creates company and admin account for Techinfo
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Company = require('../models/Company');
const Employee = require('../models/Employee');

// Techinfo Company Configuration
const COMPANY_DATA = {
  company_id: 'TEC001',
  company_name: 'Techinfo',
  admin_email: 'info@tecinfoes.com',
  admin_password: 'Admin123',
  admin_name: 'Techinfo Admin',
  employee_limit: 50,
  license_type: 'lifetime',
  department: 'Management'
};

// Admin Location (Update these with actual coordinates)
const ADMIN_LOCATION = {
  location_name: 'Techinfo Office',
  latitude: 13.0827,  // Update with actual coordinates
  longitude: 80.2707, // Update with actual coordinates
  radius_meters: 150
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log('📦 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n⚠️  Please fix MongoDB Atlas connection first:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log('   2. Network Access → Add IP: 0.0.0.0/0');
    console.log('   3. Ensure cluster is active');
    process.exit(1);
  }
};

// Register Techinfo Company
const registerTechinfoCompany = async () => {
  try {
    console.log('\n🏢 Registering Techinfo Company...\n');
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ 
      company_id: COMPANY_DATA.company_id 
    });
    
    if (existingCompany) {
      console.log('⚠️  Company already exists!');
      console.log('   Company ID:', existingCompany.company_id);
      console.log('   Company Name:', existingCompany.company_name);
      console.log('\n   To reset, delete the company first or change company_id');
      process.exit(0);
    }

    // Check if admin email already exists
    const existingAdmin = await Employee.findOne({ 
      email: COMPANY_DATA.admin_email 
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin email already exists!');
      console.log('   Email:', existingAdmin.email);
      console.log('\n   Use a different email address');
      process.exit(0);
    }

    // Create Company
    console.log('📋 Creating Company...');
    const company = await Company.create({
      company_id: COMPANY_DATA.company_id,
      company_name: COMPANY_DATA.company_name,
      admin_email: COMPANY_DATA.admin_email,
      employee_limit: COMPANY_DATA.employee_limit,
      license_type: COMPANY_DATA.license_type,
      status: 'active'
    });
    
    console.log('✅ Company Created Successfully!');
    console.log('   Company ID:', company.company_id);
    console.log('   Company Name:', company.company_name);
    console.log('   Employee Limit:', company.employee_limit);
    console.log('   License Type:', company.license_type);

    // Create Admin Employee
    console.log('\n👤 Creating Admin Account...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(COMPANY_DATA.admin_password, 10);
    
    const admin = await Employee.create({
      employee_id: 'EMP001',
      company_id: COMPANY_DATA.company_id,
      name: COMPANY_DATA.admin_name,
      email: COMPANY_DATA.admin_email,
      password: hashedPassword,
      role: 'admin',
      department: COMPANY_DATA.department,
      status: 'active',
      location_name: ADMIN_LOCATION.location_name,
      latitude: ADMIN_LOCATION.latitude,
      longitude: ADMIN_LOCATION.longitude,
      radius_meters: ADMIN_LOCATION.radius_meters
    });
    
    console.log('✅ Admin Account Created Successfully!');
    console.log('   Employee ID:', admin.employee_id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Department:', admin.department);
    console.log('   Location:', admin.location_name);
    console.log('   Geofence:', `${admin.latitude}, ${admin.longitude} (${admin.radius_meters}m)`);

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 TECHINFO COMPANY REGISTERED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    
    console.log('\n🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('─'.repeat(40));
    console.log('   Email:    ', COMPANY_DATA.admin_email);
    console.log('   Password: ', COMPANY_DATA.admin_password);
    console.log('   Role:     ', 'Admin');
    console.log('─'.repeat(40));
    
    console.log('\n📱 NEXT STEPS:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Click on Login');
    console.log('   3. Enter the credentials above');
    console.log('   4. Start managing your attendance system!');
    
    console.log('\n💡 ADMIN CAPABILITIES:');
    console.log('   • Manage employees (add, edit, delete)');
    console.log('   • View all attendance records');
    console.log('   • Generate reports');
    console.log('   • Configure company settings');
    console.log('   • Update geofence locations');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   • Update admin location coordinates in this script');
    console.log('   • Change password after first login (recommended)');
    console.log('   • Add more employees through admin panel');
    console.log('   • Each employee needs their own geofence location');
    
    console.log('\n✅ Setup Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error Registering Company:', error.message);
    if (error.code === 11000) {
      console.log('\n   Duplicate key error. Company or email already exists.');
    }
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Techinfo Company Registration Script\n');
    
    await connectDB();
    await registerTechinfoCompany();
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Registration Failed:', error.message);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = main;
