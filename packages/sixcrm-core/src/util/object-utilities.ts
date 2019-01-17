import * as _ from 'lodash';
import du from './debug-utilities';
import eu from './error-utilities';
import arrayutilities from './array-utilities';

export default class ObjectUtilities {

	static recursiveMerge(authority_object, secondary_object) {

		const return_object = authority_object;

		this.map(secondary_object, (key) => {

			if (!_.has(return_object, key)) {

				return_object[key] = secondary_object[key];

			} else {

				if (_.isObject(authority_object[key]) && _.isObject(secondary_object[key])) {
					return_object[key] = this.recursiveMerge(return_object[key], secondary_object[key]);
				}

			}

		});

		return return_object;

	}
	static removeIfExists(object, field, fatal = false) {

		if (!this.isObject(object, fatal)) {
			return object;
		}

		if (this.hasRecursive(object, field, fatal)) {

			if (_.isString(field)) {
				field = field.split('.');
			}

			return this.deepDelete(object, field);

		}

		return object;

	}

	static deepDelete(object, path_array) {

		const path = path_array.shift();

		if (path_array.length === 0) {
			delete object[path];
			return object;
		}

		object[path] = this.deepDelete(object[path], path_array);
		return object;

	}

	static getProperties(object: object, fatal: boolean = false) {

		if (!this.isObject(object, fatal)) {
			return false;
		}

		return Object.getOwnPropertyNames(object);

	}

	static getAllMethods(object, fatal = false) {

		if (!this.isObject(object, fatal)) {
			return false;
		}

		const properties = this.getProperties(object);

		return arrayutilities.filter(properties, (property) => {
			return typeof object[property] === 'function';
		});

	}

	static nonEmpty(object, fatal = false) {

		if (!this.isObject(object, fatal)) {
			return false;
		}

		if (arrayutilities.nonEmpty(Object.keys(object))) {
			return true;
		}

		if (fatal) {
			throw eu.getError('server', 'Object is empty.');
		}

		return false;

	}

	// Technical Debt:  Test Me!
	static has(object, properties, fatal = false) {

		if (!this.isObject(object, fatal)) {
			return false;
		}

		if (_.isString(properties)) {

			if (_.has(object, properties)) { return true; }

			if (fatal) {
				throw eu.getError('server', 'Object missing property "' + properties + '".');
			}

			return false;

		}

		if (arrayutilities.nonEmpty(properties, fatal)) {

			return arrayutilities.every(properties, (property) => {

				if (!_.isString(property)) {
					if (fatal) {
						throw eu.getError('server', 'Unrecognized properties object: ' + property);
					}
					return false;
				}

				if (_.has(object, property)) { return true; }

				if (fatal) {
					throw eu.getError('server', 'Object missing property "' + property + '".');
				}

				return false;

			});

		}

		throw eu.getError('server', 'Unrecognized properties object: ' + properties);

	}

	// Technical Debt:  Test Me!
	static transcribe(mapping_object: object, source_object: object, return_object: object = {}, fatal = false) {

		du.debug('Transcribe');

		this.isObject(mapping_object, true);

		this.isObject(source_object, true);

		this.map(mapping_object, (key) => {

			const map_key = mapping_object[key];

			if (!this.hasRecursive(source_object, map_key)) {

				if (fatal) {
					throw eu.getError('server', 'Missing source object field: "' + map_key + '".');
				}

			} else {

				return_object[key] = this.getKey(source_object, map_key, true);

			}

		});

		return return_object;

	}

	// Technical Debt:  Test Me!
	static map(object: object, map_function: (key: string) => any) {

		this.isObject(object, true);

		if (!_.isFunction(map_function)) {
			throw eu.getError('server', 'map_function is not a function.');
		}

		const keys = this.getKeys(object);

		const output: any[] = [];

		arrayutilities.map(keys, (key) => {
			output.push(map_function(key));
		});

		return output;

	}

	static getKey(object, key, fatal = false) {

		if (this.hasRecursive(object, key, fatal)) {

			if (!_.isArray(key)) {
				key = key.split('.');
			}

			arrayutilities.map(key, (a_key) => {
				object = object[a_key];
			});

			return object;

		}

	}

	static hasRecursive(object: object, key: string | string[], fatal: boolean = false) {

		if (!(key instanceof Array)) {
			if (typeof key === 'string') {
				key = key.split('.');
			} else {
				throw eu.getError('server', 'Key must be a array or a string.');
			}
		}

		if (key.length < 1) {
			throw eu.getError('server', 'key array must be of length 1 or greater.');
		}

		const specific_key = key[0];

		if (!_.isString(specific_key)) {
			throw eu.getError('server', 'Non-string key observed.');
		}

		if (_.has(object, specific_key)) {

			if (key.length > 1) {

				return this.hasRecursive(object[specific_key], key.slice(1, (key.length)), fatal);

			} else {

				return true;

			}

		}

		if (fatal) {

			throw eu.getError('server', 'Expected object to have key "' + arrayutilities.compress(key as any[], '.', '') + '"');

		}

		return false;

	}

	static getRecursive(object, key: string | string[], fatal = false) {

		if (!(key instanceof Array)) {
			if (typeof(key) === 'string') {
				key = key.split('.');
			} else {
				throw eu.getError('server', 'Key must be a array or a string.');
			}
		}

		if (key.length < 1) {
			throw eu.getError('server', 'key array must be of length 1 or greater.');
		}

		const specific_key = key[0];

		if (!_.isString(specific_key)) {
			throw eu.getError('server', 'Non-string key observed.');
		}

		if (_.has(object, specific_key)) {

			if (key.length > 1) {

				return this.getRecursive(object[specific_key], key.slice(1, (key.length)), fatal);

			} else {

				return object[specific_key];

			}

		}

		if (fatal) {

			throw eu.getError('server', 'Expected object to have key "' + arrayutilities.compress(key, '.', '') + '"');

		}

		return undefined;

	}

	static setRecursive(object, key: string | string[], value: any, fatal = false) {

		if (!(key instanceof Array)) {
			if (typeof(key) === 'string') {
				key = key.split('.');
			} else {
				throw eu.getError('server', 'Key must be a array or a string.');
			}
		}

		if (key.length < 1) {
			throw eu.getError('server', 'key array must be of length 1 or greater.');
		}

		const specific_key = key[0];

		if (!_.isString(specific_key)) {
			throw eu.getError('server', 'Non-string key observed.');
		}

		if (_.has(object, specific_key)) {

			if (key.length > 1) {

				this.setRecursive(object[specific_key], key.slice(1, (key.length)), value, fatal);

			} else {

				object[specific_key] = value;

			}

		}
		else if (fatal) {

			throw eu.getError('server', 'Expected object to have key "' + arrayutilities.compress(key, '.', '') + '"');

		}

		return object;

	}

	static getParentClassName(object) {

		this.isObject(object, true);

		if (!_.has(object, 'constructor') && _.has(object.constructor, 'name')) {

			const parent = Object.getPrototypeOf(object.constructor);

			if (_.has(parent, 'name')) {

				return parent.name;

			}

		}

		return null;

	}

	static getClassName(object) {

		this.isObject(object, true);

		if (_.has(object.constructor, 'name')) {

			return object.constructor.name;
		}

		return null;

	}

	static clone(object) {

		du.debug('Clone');

		this.isObject(object, true);

		return JSON.parse(JSON.stringify(object));

	}

	static additiveFilter(keys, object) {

		du.debug('Additive Filter');

		arrayutilities.isArray(keys, true);

		this.isObject(object, true);

		const return_object = {};

		keys.map((key) => {

			if (_.has(object, key)) {

				return_object[key] = object[key];

			}

		});

		return return_object;

	}

	static subtractiveFilter(keys, object) {

		du.debug('Subtractive Filter');

		arrayutilities.isArray(keys, true);

		this.isObject(object, true);

		const return_object = this.clone(object);

		keys.map((key) => {

			if (_.has(return_object, key)) {

				delete return_object[key];

			}

		});

		return return_object;

	}

	static merge() {

		du.debug('Merge');

		let return_object = {};

		const argumentation = this.getValues(arguments);

		arrayutilities.map(argumentation, (argument) => {

			this.isObject(argument, true);

			return_object = Object.assign(return_object, argument);

		});

		return return_object;

	}

	static isObject(thing, fatal = false) {

		if (_.isObject(thing)) {

			return true;

		}

		if (fatal) {

			throw eu.getError('server', 'Thing is not an object.');

		}

		return false;

	}

	static getKeys(object) {

		this.isObject(object, true);

		return Object.keys(object);

	}

	static getValues(object) {

		this.isObject(object, true);

		return Object.keys(object).map((key) => object[key]);

	}

	static getObjectType(object) {

		if (_.isArray(object)) {
			return 'array';
		}

		if (_.isString(object)) {
			return 'string';
		}

		if (_.isNumber(object)) {
			return 'number';
		}

		if (_.isBoolean(object)) {
			return 'boolean';
		}

		if (_.isObject(object)) {
			return 'object';
		}

		return null;

	}

	static recurseByDepth(object, match_function) {

		du.debug('Recurse By Depth');

		const all_results = this.recurseAll(object, match_function);

		let result: any = null;

		if (_.isObject(all_results)) {

			all_results!.forEach((all_result) => {

				if (_.isNull(result)) {

					if (_.has(all_result, 'depth') && _.has(all_result, 'match')) {
						result = all_result;
					} else {
						throw eu.getError('validation', 'Undefined result object:', all_result);
					}

				} else {

					if (_.has(all_result, 'depth') && _.has(all_result, 'match')) {
						if (all_result.depth < result!.depth) {
							result = all_result;
						}
					} else {
						throw eu.getError('validation', 'Undefined result object:', all_result);
					}

				}

			});

			if (!_.isNull(result) && _.has(result, 'match')) {

				result = result.match;

			}

		}

		return result;

	}

	static recurseAll(object: object, match_function: (key: string, value: any) => any, depth: number = 1) {

		du.debug('Recurse All');

		if (!_.isObject(object)) {
			return null;
		}

		if (!_.isFunction(match_function)) {
			throw eu.getError('validation', 'Match function must be a function.');
		}

		let results: any[] = [];

		for (const key in object) {

			const value = (_.has(object, key)) ? object[key] : key;

			if (match_function(key, value)) {

				results.push({depth, match: value});

			}

			const sub_results = this.recurseAll(value, match_function, (depth + 1));

			if (_.isArray(sub_results) && sub_results!.length > 0) {

				results = arrayutilities.merge(results, sub_results);

			}

		}

		return results;

	}

	static recurse(object, match_function) {

		du.debug('Recurse');

		let response = null;

		if (!_.isObject(object)) { return response; }

		if (!_.isFunction(match_function)) {
			throw eu.getError('validation', 'Match function must be a function.');
		}

		for (const key in object) {

			const value = (_.has(object, key)) ? object[key] : key;

			if (match_function(key, value)) {

				return value;

			}

			response = this.recurse(value, match_function);

			if (!_.isNull(response)) { return response; }

		}

		return response;

	}

	// Note:  Works but deprecated...
	// Note:  Doesn't do exactly what I intended...

	static orderedRecursion(object: object, match_function: (any) => boolean) {

		du.debug('Ordered Recursion');

		const children: any[] = [];

		for (const key in object) {

			if (match_function(object[key])) {

				return object[key];

			}

			if (_.isArray(object[key]) || _.isObject(object[key])) {

				children.push(object[key]);

			}

		}

		let recursion_result = null;

		for (const c_key in children) {

			recursion_result = this.orderedRecursion(children[c_key], match_function);

			if (!_.isNull(recursion_result)) {

				return recursion_result;

			}

		}

		return null;

	}

}
