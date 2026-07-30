// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT UTILITIES ***************
// Utility to normalize various id forms into a mongoose ObjectId when appropriate
function NormalizeObjectId(id) {
	// *************** START: Handle empty or already-normalized ids ***************
	if (!id) return id;
	if (id instanceof mongoose.Types.ObjectId) return id;
	// *************** END: Handle empty or already-normalized ids ***************

	// *************** START: Convert 24-hex string to ObjectId ***************
	if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
		return new mongoose.Types.ObjectId(id);
	}
	// *************** END: Convert 24-hex string to ObjectId ***************

	return id;
}

// *************** EXPORT MODULE ***************
module.exports = {
	NormalizeObjectId,
};
