const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  company_id: {
    type: String,
    required: [true, 'Company ID is required'],
    index: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    trim: true,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  // Individual employee geofence location
  location_name: {
    type: String,
    trim: true,
    default: 'Office Location'
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required for geofence']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required for geofence']
  },
  radius_meters: {
    type: Number,
    default: 150,
    required: [true, 'Geofence radius is required']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for queries
employeeSchema.index({ company_id: 1, employee_id: 1 });
employeeSchema.index({ company_id: 1, email: 1 });
employeeSchema.index({ company_id: 1, status: 1 });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
