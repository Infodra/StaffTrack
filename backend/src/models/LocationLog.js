const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: [true, 'Company ID is required'],
    index: true,
    uppercase: true
  },
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    index: true,
    uppercase: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  accuracy: {
    type: Number,
    required: [true, 'GPS accuracy is required']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for queries
locationLogSchema.index({ company_id: 1, employee_id: 1 });
locationLogSchema.index({ employee_id: 1, timestamp: -1 });

// TTL index to automatically delete logs older than 90 days
locationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('LocationLog', locationLogSchema);
