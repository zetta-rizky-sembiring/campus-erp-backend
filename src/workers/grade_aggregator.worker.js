// *************** IMPORT CORE ***************
const { workerData, parentPort } = require('worker_threads');

// *************** IMPORT MODULE ***************
// Establishes a dedicated MongoDB connection inside the worker's V8 isolate
const { DatabaseConnection } = require('../core/db');
const { BlockModel, SubjectModel, TestModel } = require('../features/academic/curriculum/curriculum.model');
const { StudentGradeModel } = require('../features/academic/grading/student_grade.model');
const { AcademicStandingModel } = require('../features/academic/grading/academic_standing.model');
const { DispatchAcademicStandings } = require('../shared/services/webhook.service');

/**
 * Evaluate a single grading rule against a numeric value.
 *
 * @param {Number} value - The numeric score or average to evaluate.
 * @param {Object} rule - A single grading rule definition.
 * @param {String} rule.operator - Comparison operator: '>', '>=', '<', '<=', or '=='.
 * @param {Number} rule.threshold - The boundary the operator is compared against.
 * @returns {Boolean} Whether the value satisfies the rule.
 */
function EvaluateRule(value, rule) {
  switch (rule.operator) {
    case '>':
      return value > rule.threshold;

    case '>=':
      return value >= rule.threshold;

    case '<':
      return value < rule.threshold;

    case '<=':
      return value <= rule.threshold;

    case '==':
      return value === rule.threshold;

    default:
      return false;
  }
}

/**
 * Resolve a status label from dynamic grading rules for a value.
 * Every matching rule is collected and the one with the highest threshold wins.
 *
 * @param {Number} value - The numeric score or average to evaluate.
 * @param {Array<{label: String, operator: String, threshold: Number}>} gradingRules - Rules loaded from the database.
 * @returns {String|null} The label of the winning rule, or null when no rule matches.
 */
function EvaluateStatus(value, gradingRules) {
  // ***************Keep only the rules whose operator/threshold pair is satisfied
  const matchedRules = gradingRules.filter((rule) => {
    return EvaluateRule(value, rule);
  });

  // ***************No rule matched the value, so no verdict can be derived
  if (matchedRules.length === 0) {
    return null;
  }

  // ***************Select the most restrictive rule (highest threshold) as the verdict
  const selectedRule = matchedRules.reduce((bestRule, currentRule) => {
    return currentRule.threshold > bestRule.threshold ? currentRule : bestRule;
  });

  return selectedRule.label;
}

/**
 * Resolve the total mark a student earned on a test.
 * The highest recorded score is used to tolerate duplicate grade rows.
 *
 * @param {Array<{score: Number}>} grades - Grade rows for one student/test pair.
 * @returns {Number} The maximum score among the grade rows.
 */
function GetTestTotalMark(grades) {
  return grades.reduce((maxScore, grade) => Math.max(maxScore, grade.score), 0);
}

/**
 * Worker entry point: parse the payload, aggregate standings for the cohort,
 * and persist every standing in a single bulk write.
 *
 * @returns {Promise<void>} Resolves once standings are persisted and reported to the parent thread.
 */
async function RunGradeAggregationWorker() {
  // ***************Wait for the worker database connection
  await DatabaseConnection;

  // ***************Parse the stringified worker payload
  const payload = JSON.parse(workerData);
  const { student_ids: studentIds, test_id: testId, academic_year_id: academicYearId } = payload;

  // *************** START: Resolve the Test -> Subject -> Block curriculum chain ***************
  const test = await TestModel.findById(testId).lean();

  if (!test) {
    throw new Error('Worker aborted: test not found');
  }

  const subject = await SubjectModel.findById(test.subject_id).lean();

  if (!subject) {
    throw new Error('Worker aborted: subject not found');
  }

  const block = await BlockModel.findById(subject.block_id).lean();

  if (!block) {
    throw new Error('Worker aborted: block not found');
  }
  // *************** END: Resolve the Test -> Subject -> Block curriculum chain ***************

  // *************** START: Load every subject and test inside the block ***************
  const subjects = await SubjectModel.find({
    block_id: block._id,
  }).lean();

  const subjectIds = subjects.map((subjectDoc) => subjectDoc._id);

  const tests = await TestModel.find({
    subject_id: { $in: subjectIds },
  }).lean();

  const blockTestIds = await TestModel.distinct('_id', { subject_id: { $in: subjectIds } }).lean();
  // *************** END: Load every subject and test inside the block ***************

  // ***************Fetch every grade for the cohort inside this academic year and block
  const grades = await StudentGradeModel.find({
    student_id: { $in: studentIds },
    test_id: { $in: blockTestIds },
    academic_year_id: academicYearId,
  }).lean();

  // ***************Group grades by student and test for O(1) lookups later
  const gradesByStudentAndTest = new Map();

  if (grades.length === 0) {
    throw new Error('Worker aborted: no grades found for the cohort');
  }
  for (const grade of grades) {
    const key = `${grade.student_id}_${grade.test_id}`;

    if (!gradesByStudentAndTest.has(key)) {
      gradesByStudentAndTest.set(key, []);
    }

    gradesByStudentAndTest.get(key).push(grade);
  }

  // *************** START: Compute per-test results for every student ***************
  const testResultsByStudent = new Map();

  if (!studentIds || studentIds.length === 0) {
    throw new Error('Worker aborted: no student list found for the cohort');
  }
  for (const studentId of studentIds) {
    const studentTestResults = [];

    for (const test of tests) {
      const key = `${studentId}_${test._id}`;
      const testGrades = gradesByStudentAndTest.get(key);

      // ***************Skip tests the student has not been graded on
      if (!testGrades || testGrades.length === 0) {
        continue;
      }

      const totalMark = GetTestTotalMark(testGrades);

      const testStatus = EvaluateStatus(totalMark, test.grading_rules);

      studentTestResults.push({
        test_id: test._id,
        subject_id: test.subject_id,
        total_mark: totalMark,
        test_status: testStatus,
      });
    }

    testResultsByStudent.set(studentId.toString(), studentTestResults);
  }
  // *************** END: Compute per-test results for every student ***************

  // *************** START: Roll test results up to subject averages ***************
  const subjectResultsByStudent = new Map();

  const subjectsById = new Map(subjects.map((subject) => [subject._id.toString(), subject]));

  for (const studentId of studentIds) {
    const studentTestResults = testResultsByStudent.get(studentId.toString());

    const studentSubjectResults = [];

    const testResultsBySubject = new Map();

    // ***************Group the student's test results under their subject
    for (const testResult of studentTestResults) {
      const subjectId = testResult.subject_id.toString();

      if (!testResultsBySubject.has(subjectId)) {
        testResultsBySubject.set(subjectId, []);
      }

      testResultsBySubject.get(subjectId).push(testResult);
    }

    for (const [subjectId, subjectTestResults] of testResultsBySubject) {
      const subject = subjectsById.get(subjectId);

      const totalMarks = subjectTestResults.map((result) => result.total_mark);

      // ***************Subject average is the plain mean of its tested children
      const subjectAverage = totalMarks.reduce((sum, mark) => sum + mark, 0) / totalMarks.length;

      const subjectStatus = EvaluateStatus(subjectAverage, subject.grading_rules);
      const tests = subjectTestResults.map((testResult) => ({
        test_id: testResult.test_id,
        total_mark: testResult.total_mark,
        test_status: testResult.test_status,
      }));

      studentSubjectResults.push({
        subject_id: subject._id,
        subject_average: subjectAverage,
        subject_status: subjectStatus,
        tests,
      });
    }

    subjectResultsByStudent.set(studentId.toString(), studentSubjectResults);
  }
  // *************** END: Roll test results up to subject averages ***************

  // *************** START: Roll subject averages up to the block level ***************
  const blockResultsByStudent = new Map();

  for (const studentId of studentIds) {
    const studentSubjectResults = subjectResultsByStudent.get(studentId.toString());

    // ***************Skip students with no graded subjects in the block
    if (!studentSubjectResults || studentSubjectResults.length === 0) {
      continue;
    }

    const subjectAverages = studentSubjectResults.map((result) => result.subject_average);

    // ***************Block average is the plain mean of its child subject averages
    const blockAverage = subjectAverages.reduce((sum, average) => sum + average, 0) / subjectAverages.length;

    const blockStatus = EvaluateStatus(blockAverage, block.grading_rules);

    blockResultsByStudent.set(studentId.toString(), {
      block_id: block._id,
      block_average: blockAverage,
      block_status: blockStatus,
      subjects: studentSubjectResults,
    });
  }
  // *************** END: Roll subject averages up to the block level ***************

  // *************** START: Build one upsert operation per student standing ***************
  const operations = [];
  const calculatedStandings = [];

  for (const studentId of studentIds) {
    const blockResult = blockResultsByStudent.get(studentId.toString());

    if (!blockResult) {
      continue;
    }

    calculatedStandings.push({
      student_id: studentId,
      academic_year_id: academicYearId,
      block_id: blockResult.block_id,
      block_average: blockResult.block_average,
      block_status: blockResult.block_status,
      subjects: blockResult.subjects,
    });

    operations.push({
      updateOne: {
        filter: {
          student_id: studentId,
          academic_year_id: academicYearId,
          block_id: blockResult.block_id,
        },
        update: {
          $set: {
            block_average: blockResult.block_average,
            block_status: blockResult.block_status,
            subjects: blockResult.subjects,
          },
        },
        upsert: true,
      },
    });
  }
  // *************** END: Build one upsert operation per student standing ***************

  // ***************Persist all academic standings in one bulk operation (single round-trip)
  if (operations.length > 0) {
    await AcademicStandingModel.bulkWrite(operations);

    // ***************Trigger webhook after database persistence
    await DispatchAcademicStandings(calculatedStandings);
  }

  // ***************Notify the parent thread that aggregation completed
  parentPort.postMessage({
    success: true,
    student_count: operations.length,
  });
}

// Auto-start the worker; exit cleanly after reporting so the DB handle is released
RunGradeAggregationWorker()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    parentPort.postMessage({ status: 'error', message: error.message });
    process.exit(1);
  });
