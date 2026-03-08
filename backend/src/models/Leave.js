const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
    index: true
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employee_name: {
    type: String,
    required: true
  },
  employee_email: {
    type: String,
    required: true
  },
  leave_type: {
    type: String,
    enum: ['sick', 'casual', 'annual', 'permission', 'other'],
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  days_count: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reviewed_at: {
    type: Date
  },
  admin_remarks: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
leaveSchema.index({ company_id: 1, employee_id: 1, created_at: -1 });
leaveSchema.index({ company_id: 1, status: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
