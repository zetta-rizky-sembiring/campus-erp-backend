class AppError extends Error {
	constructor(message, code = 'APP_ERROR', statusCode = 500) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

// *************** GLOBAL VARIABLES ***************
const ERROR_CODES = {
	WEIGHTAGE_LIMIT_EXCEEDED: 'WEIGHTAGE_LIMIT_EXCEEDED',
	ENTITY_LOCKED_GRADES_EXIST: 'ENTITY_LOCKED_GRADES_EXIST',
	TEST_NOT_FOUND: 'TEST_NOT_FOUND',
	INVALID_STUDENT_REFERENCE: 'INVALID_STUDENT_REFERENCE',
};

// *************** EXPORT MODULE ***************
module.exports = {
	AppError,
	ERROR_CODES,
};
