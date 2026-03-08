require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Employee = require('../models/Employee');

const resetTecinfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app');
    console.log('✅ Connected to MongoDB');

    // Delete existing Tecinfo company and employees
    const deleteCompanyResult = await Company.deleteMany({ 
      $or: [
        { admin_email: 'admin@tecinfo.com' },
        { company_id: 'TECINFO' }
      ]
    });
    console.log(`🗑️  Deleted ${deleteCompanyResult.deletedCount} company records`);

    const deleteEmployeeResult = await Employee.deleteMany({ 
      $or: [
        { email: 'admin@tecinfo.com' },
        { company_id: 'TECINFO' }
      ]
    });
    console.log(`🗑️  Deleted ${deleteEmployeeResult.deletedCount} employee records`);

    // Create new Tecinfo company
    const company = await Company.create({
      company_id: 'TECINFO',
      company_name: 'Tecinfo Engineering Solutions Pvt Ltd',
      admin_email: 'admin@tecinfo.com',
      domain: 'tecinfo.st.infodra.ai',
      office_location: {
        latitude: 17.385044,
        longitude: 78.486671
      },
      geofence_radius: 100,
      employee_limit: 100,
      license_type: 'lifetime',
      status: 'active'
    });
    console.log('✅ Created company:', company.company_name);

    // Create admin user
    const admin = await Employee.create({
      company_id: 'TECINFO',
      employee_id: 'TECINFO-ADMIN',
      name: 'Tecinfo Admin',
      email: 'admin@tecinfo.com',
      password: 'admin123', // Simple password for testing
      role: 'admin',
      latitude: 17.385044,
      longitude: 78.486671,
      radius_meters: 100
    });
    console.log('✅ Created admin user:', admin.email);
    console.log('📧 Email: admin@tecinfo.com');
    console.log('🔑 Password: admin123');

    console.log('\n✨ Tecinfo setup complete! You can now login with:');
    console.log('   Email: admin@tecinfo.com');
    console.log('   Password: admin123');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetTecinfo();
