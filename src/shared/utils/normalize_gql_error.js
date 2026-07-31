// *************** IMPORT MODULE ***************
const { AppError } = require('../../core/error');

// *************** IMPORT UTILITIES ***************
/**
 * Normalize various error shapes into GraphQL-friendly error objects
 * @param {Error|AppError} error - The error to normalize.
 * @returns {Error} Normalized GraphQL error with extensions metadata.
 */
function NormalizeGqlError(error) {
	// *************** START: Pass-through if already normalized ***************
	if (error && error.extensions) {
		return error;
	}
	// *************** END: Pass-through if already normalized ***************

	// *************** START: Convert AppError into GraphQL error with extensions ***************
	if (error instanceof AppError) {
		const normalizedError = new Error(error.message);
		normalizedError.extensions = {
			code: error.code,
			statusCode: error.statusCode,
		};
		return normalizedError;
	}
	// *************** END: Convert AppError into GraphQL error with extensions ***************

	// *************** START: Final normalization for generic/validation errors ***************
	const message = error?.message || 'Unexpected error';
	const isValidationError = typeof message === 'string' && message.startsWith('Validation failed');
	const normalizedError = new Error(message);
	normalizedError.extensions = {
		code: isValidationError ? 'VALIDATION_ERROR' : (error?.code || 'INTERNAL_SERVER_ERROR'),
		statusCode: isValidationError ? 400 : (error?.statusCode || 500),
	};
	return normalizedError;
	// *************** END: Final normalization for generic/validation errors ***************
}

// *************** EXPORT MODULE ***************
module.exports = {
	NormalizeGqlError,
};
