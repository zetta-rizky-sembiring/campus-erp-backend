// *************** IMPORT LIBRARY ***************
const puppeteer = require('puppeteer');
const { Readable } = require('stream');

// *************** GLOBAL VARIABLES ***************
let browserInstance = null;

/**
 * Launch the headless Chrome browser exactly once and cache the singleton
 * instance for the entire process lifetime.
 *
 * @returns {Promise<void>} Resolves when the browser is ready to render pages.
 */
async function InitializePDFService() {
  // *************** Strict singleton: reuse the instance if already launched
  if (browserInstance) {
    return;
  }

  browserInstance = await puppeteer.launch({
    headless: 'new',
  });
}

/**
 * Render HTML content to a PDF and return the binary stream.
 *
 * The page is opened, populated, and closed when the PDF stream finishes to
 * guarantee memory is freed after every render.
 *
 * @param {string} htmlContent - Compiled HTML to render into the PDF.
 * @returns {Promise<import('stream').Readable>} Readable PDF binary stream.
 */
async function GeneratePDFStream(htmlContent) {
  // *************** Guard: the browser must be initialized before rendering
  if (!browserInstance) {
    throw new Error('PDF service has not been initialized.');
  }

  const page = await browserInstance.newPage();

  try {
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfStream = Readable.fromWeb(
      await page.createPDFStream({
        format: 'A4',
        printBackground: true,
      }),
    );

    // *************** Guarantee the page is closed once the stream is consumed
    pdfStream.on('end', () => {
      page.close().catch(() => {});
    });

    return pdfStream;
  } catch (error) {
    // *************** Unconditional close on generation failure (memory leak prevention)
    await page.close().catch(() => {});
    throw error;
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  InitializePDFService,
  GeneratePDFStream,
};
