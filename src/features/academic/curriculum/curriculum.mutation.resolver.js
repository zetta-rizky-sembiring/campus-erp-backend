// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const {
	ValidateInput,
	createBlockSchema,
	updateBlockSchema,
	createSubjectSchema,
	updateSubjectSchema,
	createTestSchema,
	updateTestSchema,
} = require('./curriculum.validator');
const {
	EnsureSubjectWeightageWithinLimit,
	EnsureTestWeightageWithinLimit,
	EnsureNoGradesLock,
} = require('./curriculum.helper');
const { AppError } = require('../../../core/error');
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

// *************** IMPORT HELPER FUNCTION ***************
function MapInputToDbPayload(payload = {}) {
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

function SerializeBlock(document) {
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

function SerializeSubject(document) {
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

function SerializeTest(document) {
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
async function CreateBlockRecord(payload) {
	const normalizedPayload = MapInputToDbPayload(payload);
	const document = await BlockModel.create(normalizedPayload);
	return SerializeBlock(document);
}

async function UpdateBlockRecord(id, payload) {
	const normalizedPayload = MapInputToDbPayload(payload);
	const document = await BlockModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Block not found', 'NOT_FOUND', 404);
	}

	return SerializeBlock(document);
}

async function DeleteBlockRecord(id) {
	const objectId = NormalizeObjectId(id);
	await EnsureNoGradesLock('block', objectId);
	const result = await BlockModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function CreateSubjectRecord(payload) {
	const normalizedPayload = MapInputToDbPayload(payload);

	// *************** START: Ensure block subject weightage remains within limit ***************
	await EnsureSubjectWeightageWithinLimit(normalizedPayload.block_id, normalizedPayload.weightage);
	// *************** END: Ensure block subject weightage remains within limit ***************

	const document = await SubjectModel.create(normalizedPayload);
	return SerializeSubject(document);
}

async function UpdateSubjectRecord(id, payload) {
	const normalizedPayload = MapInputToDbPayload(payload);
	const document = await SubjectModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Subject not found', 'NOT_FOUND', 404);
	}

	return SerializeSubject(document);
}

async function DeleteSubjectRecord(id) {
	const objectId = NormalizeObjectId(id);
	await EnsureNoGradesLock('subject', objectId);
	const result = await SubjectModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function CreateTestRecord(payload) {
	const normalizedPayload = MapInputToDbPayload(payload);

	// *************** START: Ensure subject test weightage remains within limit ***************
	await EnsureTestWeightageWithinLimit(normalizedPayload.subject_id, normalizedPayload.weightage);
	// *************** END: Ensure subject test weightage remains within limit ***************

	const document = await TestModel.create(normalizedPayload);
	return SerializeTest(document);
}

async function UpdateTestRecord(id, payload) {
	const normalizedPayload = MapInputToDbPayload(payload);
	const document = await TestModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: normalizedPayload }, {
		new: true,
		runValidators: true,
	});

	if (!document) {
		throw new AppError('Test not found', 'NOT_FOUND', 404);
	}

	return SerializeTest(document);
}

async function DeleteTestRecord(id) {
	const objectId = NormalizeObjectId(id);
	await EnsureNoGradesLock('test', objectId);
	const result = await TestModel.deleteOne({ _id: objectId });
	return result.deletedCount > 0;
}

async function CreateBlock(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(createBlockSchema, input);
		// *************** END: Validate input payload ***************
		return CreateBlockRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function UpdateBlock(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(updateBlockSchema, input);
		// *************** END: Validate input payload ***************
		return UpdateBlockRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function DeleteBlock(_, { id }) {
	try {
		return DeleteBlockRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function CreateSubject(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(createSubjectSchema, input);
		// *************** END: Validate input payload ***************
		return CreateSubjectRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function UpdateSubject(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(updateSubjectSchema, input);
		// *************** END: Validate input payload ***************
		return UpdateSubjectRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function DeleteSubject(_, { id }) {
	try {
		return DeleteSubjectRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function CreateTest(_, { input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(createTestSchema, input);
		// *************** END: Validate input payload ***************
		return CreateTestRecord(payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function UpdateTest(_, { id, input }) {
	try {
		// *************** START: Validate input payload ***************
		const payload = ValidateInput(updateTestSchema, input);
		// *************** END: Validate input payload ***************
		return UpdateTestRecord(id, payload);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

async function DeleteTest(_, { id }) {
	try {
		return DeleteTestRecord(id);
	} catch (error) {
		throw NormalizeGqlError(error);
	}
}

// *************** EXPORT MODULE ***************
module.exports = {
	createBlock: CreateBlock,
	updateBlock: UpdateBlock,
	deleteBlock: DeleteBlock,
	createSubject: CreateSubject,
	updateSubject: UpdateSubject,
	deleteSubject: DeleteSubject,
	createTest: CreateTest,
	updateTest: UpdateTest,
	deleteTest: DeleteTest,
};
