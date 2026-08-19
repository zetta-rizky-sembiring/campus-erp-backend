// *************** IMPORT LIBRARY ***************
const express = require('express');

// *************** IMPORT MODULE ***************
const { ReportCardController } = require('./grading.rest.controller');

// *************** GLOBAL VARIABLES ***************
const router = express.Router();

// *************** REST ROUTES ***************
/**
 * Stream an immutable PDF report card for a student in a given academic year.
 *
 * @name GET /report-card/:academicYearId/:studentId
 * @param {String} academicYearId - Academic year identifier.
 * @param {String} studentId - Student identifier.
 */
router.get('/report-card/:academicYearId/:studentId', ReportCardController);

// *************** EXPORT MODULE ***************
module.exports = router;
