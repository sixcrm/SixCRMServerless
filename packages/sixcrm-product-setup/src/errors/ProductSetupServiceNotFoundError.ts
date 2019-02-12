export default class ProductSetupServiceNotFoundError extends Error {
	name = 'ProductSetupServiceNotFoundError';

	constructor() {
		super();
		Object.setPrototypeOf(this, ProductSetupServiceNotFoundError.prototype);
		this.message = 'ProductSetupService was not found.';
	}
}