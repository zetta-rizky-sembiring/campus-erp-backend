// *************** IMPORT LIBRARY ***************
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

// *************** IMPORT MODULE ***************
const { BuildReportCardDataHelper } = require('./grading.rest.helper');
const { GeneratePDFStream } = require('../../../shared/services/pdf.service');
const { HandleApiError } = require('../../../core/error');

/**
 * Transport handler for GET /api/academics/report-card/:academicYearId/:studentId.
 *
 * Orchestrates the report card request: builds the template data, compiles the
 * HTML, streams the resulting PDF to the response, and translates any error
 * through HandleApiError.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Resolves once the PDF has been piped to the response.
 */
async function ReportCardController(req, res) {
  const { academicYearId, studentId } = req.params;

  try {
    // *************** Rule 1 - Fetch and shape the report card data
    const templateData = await BuildReportCardDataHelper({
      academicYearId,
      studentId,
    });

    // *************** Rule 2 - Compile the Handlebars template with the fetched data
    const templateSource = await fs.promises.readFile(path.join(__dirname, 'templates', 'report_card.hbs'), 'utf8');
    const compiledHtml = Handlebars.compile(templateSource)(templateData);

    // *************** Rule 3 - Stream the generated PDF directly to the client
    const pdfStream = await GeneratePDFStream(compiledHtml);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ReportCard_${studentId}.pdf"`);

    pdfStream.pipe(res);
  } catch (error) {
    // *************** Log the failure before translating it for the client
    console.error('[ReportCardController] failed:', error.message);
    return HandleApiError(res, error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ReportCardController,
};
