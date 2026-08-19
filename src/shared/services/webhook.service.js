// *************** IMPORT MODULE ***************
const config = require('../../core/config');

/**
 * Dispatch the updated academic standings to the external warehouse webhook.
 *
 * Fire-and-forget: a failing external service must never crash the internal
 * grading pipeline, so errors are logged and swallowed instead of rethrown.
 *
 * @param {Array<Object>} standingsArray - Fully-mapped academic standing objects
 *   (student_id, academic_year_id, block_id, block_average, block_status, subjects).
 * @returns {Promise<void>} Resolves silently even when the dispatch fails.
 */
async function DispatchAcademicStandings(standingsArray) {
  try {
    const response = await fetch(config.webhook.warehouse, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'ACADEMIC_STANDINGS_UPDATED',
        timestamp: new Date().toISOString(),
        data: standingsArray,
      }),
    });

    if (!response.ok) {
      throw new Error('Webhook request failed');
    }
  } catch (error) {
    // ***************Log the failure without rethrowing to preserve worker state
    console.error(`Failed to dispatch webhook: ${error.message}`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  DispatchAcademicStandings,
};
