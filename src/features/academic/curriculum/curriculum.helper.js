// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { SubjectModel, TestModel } = require('./curriculum.model');
const { AppError, ERROR_CODES } = require('../../../core/error');
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

function RoundWeightage(total) {
	return Math.round((total + Number.EPSILON) * 100) / 100;
}

async function EnsureSubjectWeightageWithinLimit(blockId, incomingWeightage) {
	// *************** START: Normalize identifiers and load existing subject weightages ***************
	const blockObjectId = NormalizeObjectId(blockId);
	const subjects = await SubjectModel.find({ block_id: blockObjectId }).select('weightage').lean();
	// *************** END: Normalize identifiers and load existing subject weightages ***************

	// *************** START: Calculate total subject weightage ***************
	const existingTotal = subjects.reduce((sum, s) => sum + (Number(s.weightage) || 0), 0);
	const total = RoundWeightage(existingTotal + Number(incomingWeightage || 0));
	if (total > 100) {
		throw new AppError(
			`Total subject weightage for block ${blockId} would be ${total}%, exceeding 100%`,
			ERROR_CODES.WEIGHTAGE_LIMIT_EXCEEDED,
			400
		);
	}
	// *************** END: Calculate total subject weightage ***************

	return true;
}

/**
 * Ensure total test weightage for a subject does not exceed 100 when adding a new test.
 * @param {String|mongoose.Types.ObjectId} subjectId
 * @param {Number} incomingWeightage
 */
async function EnsureTestWeightageWithinLimit(subjectId, incomingWeightage) {
	// *************** START: Normalize identifiers and load existing test weightages ***************
	const subjectObjectId = NormalizeObjectId(subjectId);
	const tests = await TestModel.find({ subject_id: subjectObjectId }).select('weightage').lean();
	// *************** END: Normalize identifiers and load existing test weightages ***************

	// *************** START: Calculate total test weightage ***************
	const existingTotal = tests.reduce((sum, t) => sum + (Number(t.weightage) || 0), 0);
	const total = RoundWeightage(existingTotal + Number(incomingWeightage || 0));
	if (total > 100) {
		throw new AppError(
			`Total test weightage for subject ${subjectId} would be ${total}%, exceeding 100%`,
			ERROR_CODES.WEIGHTAGE_LIMIT_EXCEEDED,
			400
		);
	}
	// *************** END: Calculate total test weightage ***************

	return true;
}

/**
 * Relational locking: prevent updates/deletes if any student grades reference the entity.
 * entityType: 'block' | 'subject' | 'test'
 * entityId: string/ObjectId
 */
async function EnsureNoGradesLock(entityType, entityId) {
	// *************** START: Normalize identifier and build grade lock query ***************
	const db = mongoose.connection.db;
	const col = db.collection('studentgrades');
	const oid = NormalizeObjectId(entityId);

	let query = {};
	if (entityType === 'block') query = { block_id: oid };
	else if (entityType === 'subject') query = { subject_id: oid };
	else if (entityType === 'test') query = { test_id: oid };
	else throw new Error(`Unknown entityType: ${entityType}`);
	// *************** END: Normalize identifier and build grade lock query ***************

	const exists = await col.findOne(query, { projection: { _id: 1 } });
	if (exists) {
		throw new AppError(
			`Cannot modify ${entityType} ${entityId}: student grades exist`,
			ERROR_CODES.ENTITY_LOCKED_GRADES_EXIST,
			409
		);
	}
	return true;
}

// *************** EXPORT MODULE ***************
module.exports = {
	EnsureSubjectWeightageWithinLimit,
	EnsureTestWeightageWithinLimit,
	EnsureNoGradesLock,
};

