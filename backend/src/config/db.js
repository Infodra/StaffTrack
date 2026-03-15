const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 DNS resolution to fix SRV lookup issues on Windows
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`\n⚠️  MongoDB Connection Failed: ${error.message}`);
    console.error('   Server will continue running, but database operations will fail.');
    console.error('   Please fix MongoDB connection to enable full functionality.\n');
    // Don't exit - let server continue running
  }
};

module.exports = connectDB;
