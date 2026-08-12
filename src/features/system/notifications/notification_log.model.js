// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents a historical log of system notifications, acting as an
 * idempotency lock so automated alerts (e.g. missing grade emails) are
 * never dispatched twice for the same unique event.
 */
const NotificationLogSchema = new Schema({
  // Type of notification this log entry represents
  type: {
    type: String,
    required: true,
    enum: ['MISSING_GRADE_ALERT'],
  },
  // Student the notification is associated with
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  // Test the notification is associated with
  test_id: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  // Academic year scoping this notification event
  academic_year_id: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  // Timestamp marking when the notification was logged
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate email
NotificationLogSchema.index(
  {
    type: 1,
    student_id: 1,
    test_id: 1,
    academic_year_id: 1,
  },
  {
    unique: true,
  },
);

const NotificationLogModel = model('NotificationLog', NotificationLogSchema);

// *************** EXPORT MODEL ***************
module.exports = {
  NotificationLogModel,
};
