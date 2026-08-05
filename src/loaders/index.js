// *************** IMPORT MODULE ***************
const { CreateAcademicYearLoader } = require('./academic_year.loader');

/**
 * Creates and returns an object containing DataLoader instances for various entities.
 * @returns {Object} An object containing DataLoader instances for various entities.
 */
function createLoaders() {
  return {
    AcademicYearLoader: CreateAcademicYearLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  createLoaders,
};
