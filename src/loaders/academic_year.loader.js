// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const { AcademicYearModel } = require('../features/academic/enrollment/academic_year.model');

/**
 * Creates a DataLoader for batching and caching academic year queries.
 *
 * @returns {DataLoader}
 */
function CreateAcademicYearLoader() {
  return new DataLoader(async (academicYearIds) => {
    const academicYears = await AcademicYearModel.find({
      _id: {
        $in: academicYearIds,
      },
    }).lean();

    const academicYearMap = new Map();

    for (const academicYear of academicYears) {
      academicYearMap.set(academicYear._id.toString(), academicYear);
    }

    return academicYearIds.map((id) => academicYearMap.get(id.toString()) ?? null);
  });
}

// *************** EXPORT MODULE ***************
module.exports = CreateAcademicYearLoader;
