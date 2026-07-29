// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const {
	validateInput,
	createBlockSchema,
	updateBlockSchema,
	createSubjectSchema,
	updateSubjectSchema,
	createTestSchema,
	updateTestSchema,
} = require('./curriculum.validator');
const {
	ensureSubjectWeightageWithinLimit,
	ensureTestWeightageWithinLimit,
	ensureNoGradesLock,
} = require('./curriculum.helper');
const { AppError } = require('../../../core/error');

// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT HELPER FUNCTION ***************
function NormalizeGqlError(error) {
	if (error && error.extensions) {
		return error;
	}

	if (error instanceof AppError) {
		const normalizedError = new Error(error.message);
		normalizedError.extensions = {
			code: error.code,
			statusCode: error.statusCode,
		};
		return normalizedError;
	}

	const message = error?.message || 'Unexpected error';
	const isValidationError = typeof message === 'string' && message.startsWith('Validation failed');
	const normalizedError = new Error(message);
	normalizedError.extensions = {
		code: isValidationError ? 'VALIDATION_ERROR' : (error?.code || 'INTERNAL_SERVER_ERROR'),
		statusCode: isValidationError ? 400 : (error?.statusCode || 500),
	};
	return normalizedError;
}

function normalizeId(id) {
	if (!id) return id;
	if (id instanceof mongoose.Types.ObjectId) return id;
	if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
		return new mongoose.Types.ObjectId(id);
	}
	return id;
}

function mapInputToDbPayload(payload = {}) {
	const normalizedPayload = { ...payload };
	const fieldMap = {
		academicYear: 'academic_year',
		blockId: 'block_id',
		subjectId: 'subject_id',
		gradingRules: 'grading_rules',
	};

	Object.entries(fieldMap).forEach(([fromField, toField]) => {
		if (Object.prototype.hasOwnProperty.call(normalizedPayload, fromField)) {
			normalizedPayload[toField] = normalizedPayload[fromField];
			delete normalizedPayload[fromField];
		}
	});

	return normalizedPayload;
}

function serializeBlock(document) {
	const data = document?.toObject ? document.toObject() : document;
	return {
		id: data._id ? data._id.toString() : data.id,
		name: data.name,
		academicYear: data.academic_year || data.academicYear,
		gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
			label: rule.label,
			operator: rule.operator,
			threshold: rule.threshold,
		})),
	};
}

function serializeSubject(document) {
	const data = document?.toObject ? document.toObject() : document;
	return {
		id: data._id ? data._id.toString() : data.id,
		name: data.name,
		blockId: data.block_id ? data.block_id.toString() : data.blockId,
		weightage: data.weightage,
		gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
			label: rule.label,
			operator: rule.operator,
			threshold: rule.threshold,
		})),
	};
}

function serializeTest(document) {
	const data = document?.toObject ? document.toObject() : document;
	return {
		id: data._id ? data._id.toString() : data.id,
		name: data.name,
		subjectId: data.subject_id ? data.subject_id.toString() : data.subjectId,
		weightage: data.weightage,
		gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
			label: rule.label,
			operator: rule.operator,
			threshold: rule.threshold,
		})),
	};
}

// *************** MUTATION ***************
async function createBlockRecord(payload) {
	const normalizedPayload = mapInputToDbPayload(payload);
	const document = await BlockModel.create(normalizedPayload);
	return serializeBlock(document);
}

async function updateBlockRecord(id, payload) {
	const normalizedPayload = mapInputToDbPayload(payload);
	const document = await BlockModel.findByIdAndUpdate(normalizeId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Block not found', 'NOT_FOUND', 404);
	}

	return serializeBlock(document);
}

async function deleteBlockRecord(id) {
	const objectId = normalizeId(id);
	await ensureNoGradesLock('block', objectId);
	const result = await BlockModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function createSubjectRecord(payload) {
	const normalizedPayload = mapInputToDbPayload(payload);

	// *************** START: Ensure block subject weightage remains within limit ***************
	await ensureSubjectWeightageWithinLimit(normalizedPayload.block_id, normalizedPayload.weightage);
	// *************** END: Ensure block subject weightage remains within limit ***************

	const document = await SubjectModel.create(normalizedPayload);
	return serializeSubject(document);
}

async function updateSubjectRecord(id, payload) {
	const normalizedPayload = mapInputToDbPayload(payload);
	const document = await SubjectModel.findByIdAndUpdate(normalizeId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Subject not found', 'NOT_FOUND', 404);
	}

	return serializeSubject(document);
}

async function deleteSubjectRecord(id) {
	const objectId = normalizeId(id);
	await ensureNoGradesLock('subject', objectId);
	const result = await SubjectModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function createTestRecord(payload) {
	const normalizedPayload = mapInputToDbPayload(payload);

	// *************** START: Ensure subject test weightage remains within limit ***************
	await ensureTestWeightageWithinLimit(normalizedPayload.subject_id, normalizedPayload.weightage);
	// *************** END: Ensure subject test weightage remains within limit ***************

	const document = await TestModel.create(normalizedPayload);
	return serializeTest(document);
}

async function updateTestRecord(id, payload) {
	const normalizedPayload = mapInputToDbPayload(payload);
	const document = await TestModel.findByIdAndUpdate(normalizeId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Test not found', 'NOT_FOUND', 404);
	}

	return serializeTest(document);
}

async function deleteTestRecord(id) {
	const objectId = normalizeId(id);
	await ensureNoGradesLock('test', objectId);
	const result = await TestModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function createBlock(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(createBlockSchema, input);
		// *************** END: Validate input payload ***************
		return createBlockRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function updateBlock(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(updateBlockSchema, input);
		// *************** END: Validate input payload ***************
		return updateBlockRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function deleteBlock(_, { id }) {
	try {
		return deleteBlockRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function createSubject(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(createSubjectSchema, input);
		// *************** END: Validate input payload ***************
		return createSubjectRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function updateSubject(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(updateSubjectSchema, input);
		// *************** END: Validate input payload ***************
		return updateSubjectRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function deleteSubject(_, { id }) {
	try {
		return deleteSubjectRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function createTest(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(createTestSchema, input);
		// *************** END: Validate input payload ***************
		return createTestRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function updateTest(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = validateInput(updateTestSchema, input);
		// *************** END: Validate input payload ***************
		return updateTestRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function deleteTest(_, { id }) {
	try {
		return deleteTestRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

// *************** EXPORT MODULE ***************
module.exports = {
	createBlock,
	updateBlock,
	deleteBlock,
	createSubject,
	updateSubject,
	deleteSubject,
	createTest,
	updateTest,
	deleteTest,
};
