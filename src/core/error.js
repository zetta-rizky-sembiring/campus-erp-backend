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
	INVALID_OBJECT_ID: 'INVALID_OBJECT_ID',
	STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
	ACADEMIC_YEAR_NOT_FOUND: 'ACADEMIC_YEAR_NOT_FOUND',
	ACADEMIC_STANDING_NOT_FOUND: 'ACADEMIC_STANDING_NOT_FOUND',
};

/**
 * Translate an error into a structured REST JSON response.
 *
 * AppError instances expose their business code and HTTP status; any other
 * error is masked as a generic 500 to avoid leaking stack traces.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Error} error - The caught error to translate.
 * @returns {import('express').Response} The formatted error response.
 */
function HandleApiError(res, error) {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			status: 'fail',
			code: error.code,
			message: error.message,
		});
	}

	return res.status(500).json({
		status: 'error',
		code: 'INTERNAL_SERVER_ERROR',
		message: 'An internal server error occurred.',
	});
}

// *************** EXPORT MODULE ***************
module.exports = {
	AppError,
	ERROR_CODES,
	HandleApiError,
};
