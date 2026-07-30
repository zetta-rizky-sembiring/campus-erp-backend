const mongoose = require('mongoose');

function normalizeObjectId(id) {
	if (!id) return id;
	if (id instanceof mongoose.Types.ObjectId) return id;
	if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
		return new mongoose.Types.ObjectId(id);
	}
	return id;
}

module.exports = {
	normalizeObjectId,
};
