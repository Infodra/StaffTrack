const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  attendance_id: {
    type: String,
    required: [true, 'Attendance ID is required'],
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
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    index: true,
    uppercase: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  check_in: {
    type: Date,
    required: true
  },
  check_out: {
    type: Date,
    default: null
  },
  working_hours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
    default: 'present'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
attendanceSchema.index({ company_id: 1, employee_id: 1, date: -1 });
attendanceSchema.index({ company_id: 1, date: -1 });
attendanceSchema.index({ employee_id: 1, date: -1 });

// Ensure one attendance record per employee per day
attendanceSchema.index(
  { company_id: 1, employee_id: 1, date: 1 },
  { unique: true }
);

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.check_in && this.check_in.time && this.check_out && this.check_out.time) {
    const diff = this.check_out.time - this.check_in.time;
    this.working_hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
