/**
 * MongoDB Connection Test
 */

const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB Connection...');
    console.log('📍 URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📦 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Existing Collections:', collections.length);
    collections.forEach(col => console.log('  •', col.name));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    console.log('\n🔍 Troubleshooting Tips:');
    console.log('1. Check if MongoDB Atlas cluster is active');
    console.log('2. Verify network access (IP whitelist) in MongoDB Atlas');
    console.log('3. Confirm username and password are correct');
    console.log('4. Check if your internet connection is working');
    console.log('5. Try accessing MongoDB Atlas dashboard in browser');
    
    process.exit(1);
  }
};

testConnection();
