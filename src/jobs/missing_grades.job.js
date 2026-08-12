// *************** IMPORT LIBRARY ***************
const cron = require('node-cron');

// *************** IMPORT MODULE ***************
const { NotificationLogModel } = require('../features/system/notifications/notification_log.model');
const { AcademicYearModel } = require('../features/academic/enrollment/academic_year.model');
const { UserModel } = require('../features/users/user.model');
const { SendEmail } = require('../shared/services/email.service');

// *************** QUERY ***************
/**
 * Aggregates all student/test/academic-year combinations that are expected
 * but currently have no submitted grade.
 *
 * @returns {Promise<Array<Object>>} Array of missing-grade combinations with
 *   academic_year_id, student_id, test_id and display metadata.
 */
async function FindMissingGrades() {
  return await AcademicYearModel.aggregate([
    // *************** Filter to the currently active academic year
    {
      $match: { status: 'ACTIVE' },
    },
    // *************** Deconstruct the enrolled students
    {
      $unwind: '$student_ids',
    },
    // *************** Deconstruct the curriculum blocks
    {
      $unwind: '$block_ids',
    },
    // *************** Join student details for a readable alert
    {
      $lookup: {
        from: 'students',
        localField: 'student_ids',
        foreignField: '_id',
        as: 'student_data',
      },
    },
    {
      $unwind: '$student_data',
    },
    // *************** Join the Block document
    {
      $lookup: {
        from: 'blocks',
        localField: 'block_ids',
        foreignField: '_id',
        as: 'block_data',
      },
    },
    {
      $unwind: '$block_data',
    },
    // *************** Join the Subject documents belonging to the block
    {
      $lookup: {
        from: 'subjects',
        localField: 'block_data._id',
        foreignField: 'block_id',
        as: 'subject_data',
      },
    },
    {
      $unwind: '$subject_data',
    },
    // *************** Join the expected Test documents belonging to the subject
    {
      $lookup: {
        from: 'tests',
        localField: 'subject_data._id',
        foreignField: 'subject_id',
        as: 'test_data',
      },
    },
    {
      $unwind: '$test_data',
    },
    // *************** Join existing grades for this student/test/academic-year combination
    {
      $lookup: {
        from: 'studentgrades',
        let: { studentId: '$student_ids', testId: '$test_data._id', academicYearId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$student_id', '$$studentId'] },
                  { $eq: ['$test_id', '$$testId'] },
                  { $eq: ['$academic_year_id', '$$academicYearId'] },
                ],
              },
            },
          },
        ],
        as: 'grade_data',
      },
    },
    // *************** Keep only combinations where no grade exists
    {
      $match: { grade_data: { $size: 0 } },
    },
    // *************** Shape the result into clean identifiers for the audit loop
    {
      $project: {
        academic_year_id: '$_id',
        student_id: '$student_ids',
        test_id: '$test_data._id',
        academic_year_name: '$name',
        student_name: { $concat: ['$student_data.first_name', ' ', '$student_data.last_name'] },
        test_name: '$test_data.name',
        _id: 0,
      },
    },
  ]);
}

// *************** HELPER FUNCTION ***************
/**
 * Audits missing grades, dispatching an alert email to a random teacher and
 * recording a NotificationLog entry to guarantee idempotency.
 *
 * @returns {Promise<void>}
 */
async function RunMissingGradeAuditor() {
  let missingGrades;

  try {
    missingGrades = await FindMissingGrades();
  } catch (error) {
    console.error('Missing grade aggregation failed:', error.message);
    return;
  }

  if (missingGrades.length === 0) {
    return;
  }

  // *************** Resolve alert recipients once: every user holding the TEACHER role
  const teacherUsers = await UserModel.find({ role: 'TEACHER' }).select('email').lean();

  if (teacherUsers.length === 0) {
    console.error('Missing grade auditor aborted: no users with role TEACHER found.');
    return;
  }

  // *************** Sequential awaits: Promise.all() on hundreds of SMTP calls would trip rate limits
  for (const missing of missingGrades) {
    // *************** START: Idempotency check ***************
    const existingLog = await NotificationLogModel.findOne({
      type: 'MISSING_GRADE_ALERT',
      student_id: missing.student_id,
      test_id: missing.test_id,
      academic_year_id: missing.academic_year_id,
    });

    if (existingLog) {
      continue;
    }
    // *************** END: Idempotency check ***************

    // *************** START: Dispatch email + lock notification ***************
    // *************** Pick a random teacher as the recipient for this alert
    const randomTeacher = teacherUsers[Math.floor(Math.random() * teacherUsers.length)];

    const htmlBody = `
      <h2>Missing Grade Alert</h2>
      <p>Dear Teacher,</p>
      <p>The following student has <strong>no grade</strong> recorded for an expected test:</p>
      <ul>
        <li><strong>Academic Year:</strong> ${missing.academic_year_name}</li>
        <li><strong>Student:</strong> ${missing.student_name}</li>
        <li><strong>Test:</strong> ${missing.test_name}</li>
      </ul>
      <p>Please submit the grade as soon as possible.</p>
    `;

    try {
      await SendEmail(randomTeacher.email, `[MISSING GRADE] ${missing.student_name} - ${missing.test_name}`, htmlBody);

      await NotificationLogModel.create({
        type: 'MISSING_GRADE_ALERT',
        student_id: missing.student_id,
        test_id: missing.test_id,
        academic_year_id: missing.academic_year_id,
      });
    } catch (error) {
      console.error('Failed to dispatch missing grade alert:', error.message);
    }
    // *************** END: Dispatch email + lock notification ***************
  }
}

// *************** CRON SCHEDULER ***************
let auditorTask = null;
let auditorRunning = false;

/**
 * Schedules the missing grade auditor cron job to run every minute.
 * Idempotent: a second call returns the already scheduled task.
 *
 * @returns {Object} The scheduled node-cron task.
 */
function InitializeGradeAuditorJob() {
  if (auditorTask) {
    return auditorTask;
  }

  auditorTask = cron.schedule('* * * * *', async () => {
    // *************** In-flight guard: never overlap runs while the previous one is still sending emails
    if (auditorRunning) {
      console.log('Missing grade auditor still running from previous tick; skipping.');
      return;
    }

    auditorRunning = true;
    try {
      await RunMissingGradeAuditor();
    } catch (error) {
      console.error('Missing grade auditor job failed:', error.message);
    } finally {
      auditorRunning = false;
    }
  });

  return auditorTask;
}

// *************** EXPORT MODULE ***************
module.exports = {
  InitializeGradeAuditorJob,
};
