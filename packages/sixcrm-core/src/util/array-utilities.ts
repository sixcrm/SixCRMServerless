import * as _ from 'lodash';
import eu from './error-utilities';

export default class ArrayUtilities {

	static forEach(array: any[], iterator: (value: any, index: number, array: any[]) => void) {
		// Technical debt: Remove this type checking once we're using TS everywhere, TS does this for us
		this.isArray(array, true);
		if (!_.isFunction(iterator)) {
			throw eu.getError('server', 'ArrayUtilities.forEach iterator is not a function.');
		}

		array.forEach(iterator);
	}

	// Technical Debt:  Needs testing.
	static group(object_array: object[], differentiator_acquisition_function: (object) => any) {

		this.isArray(object_array, true);

		if (!_.isFunction(differentiator_acquisition_function)) {
			throw eu.getError('server', 'ArrayUtilities.group differentiator_acquisition_function is not a function.');
		}

		const return_object = {};

		this.map(object_array, (object_array_element) => {

			const differentiator = differentiator_acquisition_function(object_array_element);

			if (!_.isNull(differentiator)) {

				if (!_.has(return_object, differentiator)) {
					return_object[differentiator] = [object_array_element];
				} else {
					return_object[differentiator].push(object_array_element);
				}

			}

		});

		return return_object;

	}

	static flatten(multidimensional_array: any, depth: number = 0) {

		if (depth > 20) {
			throw eu.getError('server', 'Array Utilities flatten recursion depth exceeded.');
		}

		const return_object: any[] = [];

		if (this.isArray(multidimensional_array)) {

			this.map(multidimensional_array, (multidimensional_array_element) => {

				const flattened_array = this.flatten(multidimensional_array_element, (depth + 1));

				this.map(flattened_array, (flattened_array_element) => {

					return_object.push(flattened_array_element);

				});

			});

		} else {

			return_object.push(multidimensional_array);

		}

		return return_object;

	}

	static nonEmpty(thing: any[], fatal: boolean = false) {

		if (this.isArray(thing, fatal)) {

			if (thing.length > 0) {

				return true;

			}

		}

		if (fatal) {

			throw eu.getError('server', 'Array is empty.');

		}

		return false;

	}

	static isArray(thing: any, fatal: boolean = false) {

		if (!_.isArray(thing)) {

			if (fatal) {

				throw eu.getError('server', 'ArrayUtilities.isArray thing argument is not an array.');

			}

			return false;

		}

		return true;

	}

	static assureEntries(a_array, type) {

		const validation_functions = {
			number: (array_value) => {
				return _.isNumber(array_value);
			},
			string: (array_value) => {
				return _.isString(array_value);
			},
			object: (array_value) => {
				return _.isObject(array_value);
			},
			array: (array_value) => {
				return _.isArray(array_value);
			},
			error: (array_value) => {
				return _.isError(array_value);
			}
		};

		if (!_.has(validation_functions, type)) {

			throw eu.getError('server', 'ArrayUtilities.assureEntities type has unknown value.');

		}

		return this.every(a_array, validation_functions[type]);

	}

	static sort(sort_array, sort_function?) {

		if (_.isUndefined(sort_function)) {
			sort_function = (a, b) => {
				return a - b;
			};
		}

		this.nonEmpty(sort_array, true);

		if (!_.isFunction(sort_function)) {
			throw eu.getError('server', 'ArrayUtilities.sort sort_function argument is not a function.');
		}

		if (sort_array.length < 2) {
			return sort_array;
		}

		return sort_array.sort(sort_function);

	}

	static every(array, a_function) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.every array argument is not a array.');
		}

		if (!_.isFunction(a_function)) {
			throw eu.getError('validation', 'ArrayUtilities.every function argument is not a function.');
		}

		const return_array = array.every(a_function);

		return return_array;

	}

	static map(array, a_function) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.map array argument is not a array.');
		}

		if (!_.isFunction(a_function)) {
			throw eu.getError('validation', 'ArrayUtilities.map function argument is not a function.');
		}

		const return_array = array.map(a_function);

		return return_array;

	}

	static compress(precompression_array: any[], delimiter = ',', quote_style = '\'') {

		this.validateArray(precompression_array);

		return quote_style + precompression_array.join(quote_style + delimiter + quote_style) + quote_style;

	}

	static removeElement(array_object, element) {

		this.validateArray(array_object);

		if (!_.includes(array_object, element)) {
			return array_object;
		}

		const index = array_object.indexOf(element);

		if (index > -1) {
			array_object.splice(index, 1);
		}

		return array_object;

	}

	static validateArray(thing) {
		if (!_.isArray(thing)) {
			throw eu.getError('validation', 'Compress only accepts array arguments');
		}
		return true;
	}

	static merge(array1, array2) {

		if (!_.isArray(array1)) {
			throw eu.getError('validation', 'ArrayUtilities.merge array argument 1 is not a array.');
		}

		return array1.concat(array2);

	}

	static filter(array, filter_function) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.filter array argument is not a array.');
		}

		if (!_.isFunction(filter_function)) {
			throw eu.getError('validation', 'ArrayUtilities.filter filter function is not a function.');
		}

		const return_array = array.filter(filter_function);

		return return_array;

	}

	static find(array, find_function) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.find array argument is not a array.');
		}

		if (!_.isFunction(find_function)) {
			throw eu.getError('validation', 'ArrayUtilities.find find function is not a function.');
		}

		return array.find(find_function);

	}

	static serialPromises(array_of_promises) {

		return this.reduce(
			array_of_promises,
			(promiseChain, currentTask) => {
				return promiseChain.then((chainResults) =>
					Promise.resolve(currentTask).then((currentResult) => [...chainResults, currentResult])
				);
			},
			Promise.resolve([])
		).then((results) => {
			return results;
		});

	}

	static serial(array: Array<() => Promise<any>>, reduction_function?, initial_value: Promise<any> = Promise.resolve()) {

		if (_.isUndefined(reduction_function) || !_.isFunction(reduction_function)) {

			reduction_function = (current, next) => {
				if (_.isUndefined(current)) {
					return next;
				}
				return current.then(next);
			};

		}

		return this.reduce(array, reduction_function, initial_value);

	}

	// Technical Debt: This should probably be integrated in 'serial' function.
	/**
	 * Executes promises wrapped in functions sequentially. Same as 'serial' but keeps the results in
	 * the chronological order in the result array, similar to Promise.all.
	 *
	 * @param array
	 * @param reduction_function
	 * @param initial_value
	 *
	 * @returns Array of results in chronological order.
	 */
	static serialAll(array, reduction_function, initial_value) {

		initial_value = (_.isUndefined(initial_value)) ? Promise.resolve([]) : initial_value;

		if (_.isUndefined(reduction_function) || !_.isFunction(reduction_function)) {

			reduction_function = (current, next) => {
				if (_.isUndefined(current)) {
					return next;
				}
				return current.then((r) => next().then((s) => [...r, s]));
			};

		}

		return this.reduce(array, reduction_function, initial_value);

	}

	static reduce(array, reduce_function?, initial_value: any = 0) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.reduce array argument is not a array.');
		}

		if (!_.isFunction(reduce_function)) {
			throw eu.getError('validation', 'ArrayUtilities.reduce reduce function is not a function.');
		}

		if (_.isUndefined(initial_value)) {
			initial_value = 0;
		}

		return array.reduce(reduce_function, initial_value);

	}

	static unique(array) {

		const a = array.concat();

		for (let i = 0; i < a.length; ++i) {
			for (let j = i + 1; j < a.length; ++j) {
				if (a[i] === a[j]) {
					a.splice(j--, 1);
				}
			}
		}

		return a;

	}

	static chunk(array, size) {

		this.validateArray(array);

		if (!isNatural(size)) {
			throw eu.getError('server', 'ArrayUtilities.chunk assumes a non-zero, non-negative integer size argument');
		}

		return array.map((e, i) => {
			if (i % size === 0) {
				return array.slice(i, (i + size));
			} else {
				return null;
			}
		}).filter((e) => {
			return e;
		});

		function isNatural(number) {
			return (number > 0) && (Math.floor(number) === number);
		}

	}

	static last(array) {

		if (!_.isArray(array)) {
			throw eu.getError('validation', 'ArrayUtilities.last array argument is not a array.');
		}

		return array[array.length - 1];
	}

}
