/**
 * Test Login Script - Direct database check
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Employee = require('../models/Employee');
const Company = require('../models/Company');

const testLogin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    
    const testEmail = 'raj@tecinfo.com';
    const testPassword = 'password123';
    
    console.log('\n🔍 Testing login for:', testEmail);
    console.log('Password:', testPassword);
    
    // Find employee
    console.log('\n1. Looking up employee...');
    const employee = await Employee.findOne({ email: testEmail }).select('+password');
    
    if (!employee) {
      console.log('❌ Employee not found!');
      process.exit(1);
    }
    
    console.log('✅ Employee found:', employee.name);
    console.log('   Employee ID:', employee.employee_id);
    console.log('   Company ID:', employee.company_id);
    console.log('   Role:', employee.role);
    console.log('   Status:', employee.status);
    console.log('   Password Hash:', employee.password.substring(0, 20) + '...');
    
    // Check password
    console.log('\n2. Checking password...');
    const isMatch = await employee.comparePassword(testPassword);
    
    if (!isMatch) {
      console.log('❌ Password does not match!');
      
      // Test manual bcrypt compare
      console.log('\n3. Testing manual bcrypt compare...');
      const manualMatch = await bcrypt.compare(testPassword, employee.password);
      console.log('   Manual bcrypt result:', manualMatch);
      
      process.exit(1);
    }
    
    console.log('✅ Password matches!');
    
    // Find company
    console.log('\n4. Looking up company...');
    const company = await Company.findOne({ company_id: employee.company_id });
    
    if (!company) {
      console.log('❌ Company not found!');
      console.log('   Searched for company_id:', employee.company_id);
      
      // List all companies
      const allCompanies = await Company.find({});
      console.log('\n   Available companies:');
      allCompanies.forEach(c => {
        console.log(`   - ${c.company_id}: ${c.company_name}`);
      });
      
      process.exit(1);
    }
    
    console.log('✅ Company found:', company.company_name);
    console.log('   Company Status:', company.status);
    
    console.log('\n✅ Login test PASSED! Login should work.');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testLogin();
