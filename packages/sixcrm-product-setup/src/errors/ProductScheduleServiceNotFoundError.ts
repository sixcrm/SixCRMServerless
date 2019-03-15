export default class ProductScheduleServiceNotFoundError extends Error {
	name = 'ProductScheduleServiceNotFoundError';

	constructor() {
		super();
		Object.setPrototypeOf(this, ProductScheduleServiceNotFoundError.prototype);
		this.message = 'ProductScheduleService was not found.';
	}
}
