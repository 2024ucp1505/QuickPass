const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'flagged_proxy', 'cancelled'],
      default: 'present',
    },
    undoExpiresAt: {
      type: Date,
      default: null,
    },
    proxyFlag: {
      suspectedDeviceId: { type: String, default: null },
      suspectedStudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance in same session
attendanceLogSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
