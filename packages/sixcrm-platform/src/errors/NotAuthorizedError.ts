export default class NotAuthorizedError extends Error {

	name = 'NotAuthorizedError';

	constructor(message?: string) {

		super(message || 'Not authorized to access this resource.');

	}

}
