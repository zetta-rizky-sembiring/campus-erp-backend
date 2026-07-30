const { AppError } = require('../../core/error');

function normalizeGqlError(error) {
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

module.exports = {
	normalizeGqlError,
};
