export default class EntityValidationError<T> extends Error {

	constructor(propertyName: keyof T, instance: T, message: string = '') {
		super();
		this.message = `Instance of ${instance.constructor.name} has invalid value for '${propertyName}': ${JSON.stringify(instance[propertyName])}. ${message}`;
	}
}
