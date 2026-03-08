const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: [true, 'Company ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  company_name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  admin_email: {
    type: String,
    required: [true, 'Admin email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    comment: 'Full domain for this tenant (e.g., tecinfo.st.infodra.ai)'
  },
  office_location: {
    latitude: {
      type: Number,
      required: [true, 'Office latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Office longitude is required']
    }
  },
  geofence_radius: {
    type: Number,
    default: 100,
    comment: 'Geofence radius in meters'
  },
  employee_limit: {
    type: Number,
    required: [true, 'Employee limit is required'],
    default: 50
  },
  license_type: {
    type: String,
    enum: ['lifetime', 'annual', 'monthly'],
    default: 'lifetime'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
companySchema.index({ company_name: 1 });
companySchema.index({ admin_email: 1 });

module.exports = mongoose.model('Company', companySchema);
