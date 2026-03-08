require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const addSampleEmployees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app');
    console.log('✅ Connected to MongoDB');

    const sampleEmployees = [
      {
        company_id: 'TECINFO',
        employee_id: 'TECINFO-EMP001',
        name: 'Murugan S',
        email: 'murugan@tecinfo.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        latitude: 17.385044,
        longitude: 78.486671,
        radius_meters: 100
      },
      {
        company_id: 'TECINFO',
        employee_id: 'TECINFO-EMP002',
        name: 'Priya Sharma',
        email: 'priya@tecinfo.com',
        password: 'password123',
        role: 'employee',
        department: 'Marketing',
        latitude: 17.385044,
        longitude: 78.486671,
        radius_meters: 100
      },
      {
        company_id: 'TECINFO',
        employee_id: 'TECINFO-EMP003',
        name: 'Rajesh Kumar',
        email: 'rajesh@tecinfo.com',
        password: 'password123',
        role: 'employee',
        department: 'Sales',
        latitude: 17.385044,
        longitude: 78.486671,
        radius_meters: 100
      },
      {
        company_id: 'TECINFO',
        employee_id: 'TECINFO-EMP004',
        name: 'Anitha Reddy',
        email: 'anitha@tecinfo.com',
        password: 'password123',
        role: 'employee',
        department: 'HR',
        latitude: 17.385044,
        longitude: 78.486671,
        radius_meters: 100
      },
      {
        company_id: 'TECINFO',
        employee_id: 'TECINFO-EMP005',
        name: 'Karthik Varma',
        email: 'karthik@tecinfo.com',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        latitude: 17.385044,
        longitude: 78.486671,
        radius_meters: 100
      }
    ];

    // Delete existing sample employees (keep admin)
    await Employee.deleteMany({ 
      company_id: 'TECINFO',
      role: 'employee'
    });
    console.log('🗑️  Cleared existing employees');

    // Create new employees
    for (const empData of sampleEmployees) {
      try {
        await Employee.create(empData);
        console.log(`✅ Created: ${empData.name} (${empData.email})`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  Skipped ${empData.email} - already exists`);
        } else {
          console.error(`❌ Error creating ${empData.name}:`, err.message);
        }
      }
    }

    console.log('\n✨ Sample employees added successfully!');
    console.log('📧 All employees have password: password123');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addSampleEmployees();
