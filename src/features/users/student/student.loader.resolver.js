// *************** LOADER ***************
/**
 * Load academic years for a student using DataLoader.
 * @param {Object} parent - The parent object containing the student data.
 * @param {*} _ - GraphQL parent resolver (not used).
 * @param {Object} context - The GraphQL context containing the AcademicYearLoader.
 * @returns {Promise<Array>} A promise that resolves to an array of academic years.
 */
async function StudentAcademicYears(parent, _, context) {
  return context.AcademicYearLoader.loadMany(parent.academic_year_ids);
}

// *************** EXPORT MODULE ***************
module.exports = {
  StudentAcademicYears,
};
