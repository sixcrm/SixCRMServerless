const _ = require('lodash');
const fs = require('fs');
const Ajv = require('ajv');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const cacheController = global.SixCRM.routes.include('controllers', 'providers/Cache.js');
const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
//Technical Debt:  Create SQL Query Builder class and abstract the query building methods there.

module.exports = class AnalyticsUtilities extends PermissionedController {

	constructor() {

		super();

		this.period_options = [{
			name: 'minute',
			seconds: 60
		},
		{
			name: 'hour',
			seconds: 3600
		},
		{
			name: 'day',
			seconds: 86400
		},
		{
			name: 'week',
			seconds: 604800
		},
		{
			name: 'month',
			seconds: 2678400
		},
		{
			name: 'quarter',
			seconds: 7776000
		},
		{
			name: 'year',
			seconds: 30412800
		}
		];

		this.cacheController = new cacheController();

		this.period_count_default = 30;

		this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

	}

	executeAnalyticsFunction(argumentation, function_name) {

		if (_.isFunction(this[function_name])) {

			return this.can({
				action: function_name,
				object: 'analytics',
				fatal: false
			}).then((permission) => {

				if (permission !== true) {

					throw eu.getError('forbidden', 'Invalid Permissions: user can not perform this action on class Analytics.');

				}

				this.setCacheSettings(argumentation);

				return this[function_name](argumentation);

			});

		}

		throw eu.getError('server', 'AnalyticsController.' + function_name + ' is not defined.');

	}

	setCacheSettings(parameters) {

		du.debug('Set Cache Settings');

		if (_.has(parameters, 'cache')) {

			if (_.has(parameters.cache, 'use_cache') && parameters.cache.use_cache === false) {

				this.cacheController.setDisable(true);

			}

		}

	}

	//Technical Debt:  Messy.  Refactor.
	getResults(query_name, parameters, query_filters) {

		du.debug('Get Results');

		return new Promise((resolve, reject) => {

			this.validateQueryParameters(query_name, parameters).then(() => {

				parameters = this.appendAccount(parameters);

				parameters = this.createQueryFilter(parameters, query_filters);

				return this.getQueryString(query_name).then((query) => {

					query = this.parseQueryParameters(query, parameters);

					du.info('Query:', query, parameters);

					let transformation_function = this.getTransformationFunction(query_name);

					const auroraContext = global.SixCRM.getResource('auroraContext');

					return auroraContext.connection.queryWithArgs(query, [])
						.then(result => result.rows)
						.then((results) => transformation_function(results, parameters))
						.then((transformed_results) => {
							return resolve(transformed_results);
						});

					// return this.cacheController.useCache(query, () => auroraContext.connection.queryWithArgs(query, []).then(result => result.rows))
					// 	.then((results) => transformation_function(results, parameters))
					// 	.then((transformed_results) => {
					// 		return resolve(transformed_results);
					// 	});

				})
					.catch((error) => {

						return reject(error);

					});

			})
				.catch((error) => {

					return reject(error);

				});

		});

	}

	periodSelection(start, end, target_period_count) {

		du.debug('Period Selection');
		du.debug('Parameters: ', start, end, target_period_count);

		let start_timestamp = timestamp.dateToTimestamp(start);
		let end_timestamp = timestamp.dateToTimestamp(end);
		let best_period = null;
		let best_period_score = null;

		this.period_options.forEach((period) => {

			let seconds_difference = (end_timestamp - start_timestamp);

			let period_seconds = period.seconds;

			let this_period_delta = Math.pow(((seconds_difference / period_seconds) - target_period_count), 2);

			if (_.isNull(best_period_score) || this_period_delta < best_period_score) {

				best_period_score = this_period_delta;

				best_period = period;

			}

		});

		du.debug('Selected Period: ', best_period);

		return best_period;

	}

	getTargetPeriodCount(parameters) {

		du.debug('Get Target Period Count');

		if (_.has(parameters, 'targetperiodcount')) {

			return parameters.targetperiodcount;

		}

		return this.period_count_default;

	}

	createQueryFilter(parameters, filters_array) {

		du.debug('Create Query Filter', parameters, filters_array);

		let filter_array = [];

		filters_array.forEach((filter) => {

			if (_.has(parameters, filter)) {

				du.info(filter, parameters[filter]);

				if (_.isArray(parameters[filter]) && parameters[filter].length > 1) {

					if (_.isNumber(parameters[filter][0])) {

						filter_array.push(filter + ' IN (' + parameters.join(',') + ')');

					} else {

						filter_array.push(filter + ' IN (' + parameters.map(p => `'${p}'`).join(',') + ')');

					}

				} else {

					const val = _.isNumber(parameters[filter]) ? parameters[filter] : `'${parameters[filter]}'`;

					filter_array.push(filter + ' = ' + val);

				}

			}

		});

		if (_.has(parameters, 'additional_filters') && _.isArray(parameters.additional_filters) && parameters.additional_filters.length > 0) {

			filter_array = filter_array.concat(parameters.additional_filters);

			delete parameters.additional_filters;

		}

		if (filter_array.length > 0) {
			parameters['filter'] = ' AND ' + filter_array.join(' AND ');
		} else {
			parameters['filter'] = ' AND 1 = 1 '
		}

		return parameters;

	}

	compressParameters(parameters) {

		for (let key in parameters) {

			if (_.isArray(parameters[key])) {

				parameters[key] = arrayutilities.compress(parameters[key]);

			}

		}

		return parameters;

	}

	parseQueryParameters(query, parameters) {

		du.debug('Parse Query Parameters');

		let compressed_query_parameters = this.compressParameters(parameters);

		return parserutilities.parse(query, compressed_query_parameters);

	}

	//Technical Debt:  Refactor
	validateQueryParameters(query_name, object) {

		//Technical Debt:  Why is this necessary?
		object = JSON.parse(JSON.stringify(object));

		du.debug('Validating:', query_name + ' query parameters', object);

		return new Promise((resolve, reject) => {

			return this.getQueryParameterValidationString(query_name).then((query_validation_string) => {

				let validation;

				du.debug(object, query_validation_string);

				try {

					const ajv = new Ajv({
						schemaId: 'auto',
						format: 'full',
						allErrors: true,
						verbose: true
					});

					ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

					const valid = ajv.validate(query_validation_string, object);

					validation = {
						valid,
						errors: ajv.errors
					}

				} catch (e) {

					return reject(eu.getError('server', 'Unable to instantiate validator.'));

				}

				if (_.has(validation, 'errors') && _.isArray(validation.errors) && validation.errors.length > 0) {

					du.warning(validation.errors);

					return reject(eu.getError(
						'bad_request',
						'One or more validation errors occurred.', {
							issues: validation.errors.map(e => e.message)
						}
					));

				}

				du.info('Input parameters validate.');

				return resolve(true);

			});

		});

	}

	getQueryString(query_name) {

		du.debug('Get Query String');

		return new Promise((resolve, reject) => {

			let query_filepath = this.getQueryFilepath(query_name);

			du.debug('Filepath: ', query_filepath);

			fs.readFile(query_filepath, 'utf8', (error, data) => {

				if (error) {
					return reject(error);
				}

				return resolve(data);

			});

		});

	}

	getQueryParameterValidationString(query_name) {

		du.debug('Get Query Parameter Validation String');

		return new Promise((resolve) => {

			let query_validation_filepath = this.getQueryParameterValidationFilepath(query_name);

			du.debug('Filepath: ', query_validation_filepath);

			let schema = require(query_validation_filepath);

			return resolve(schema);

		});

	}

	getQueryFilepath(query_name) {

		du.debug('Get Query Filepath');

		return `${__dirname}/queries/${query_name}/query.sql`;

	}

	getTransformationFunctionFilepath(query_name) {

		du.debug('Get Transformation Function Filepath');

		let transformation_function_filepath = __dirname + '/queries/' + query_name + '/transform.js';
		let default_transformation_function_filepath = __dirname + '/queries/default/transform.js';

		if (fs.existsSync(transformation_function_filepath)) {
			return transformation_function_filepath;
		} else {
			du.warning('Using default query transformation function');
			return default_transformation_function_filepath;
		}

	}

	getQueryParameterValidationFilepath(query_name) {

		du.debug('Get Query Parameter Validation Filepath');

		let query_parameter_validation_filepath = __dirname + '/queries/' + query_name + '/parameter_validation.json';
		let default_query_parameter_validation_filepath = __dirname + '/queries/default/parameter_validation.json';

		if (fs.existsSync(query_parameter_validation_filepath)) {
			return query_parameter_validation_filepath;
		} else {
			du.warning('Using default query parameter validation');
			return default_query_parameter_validation_filepath;
		}

	}

	getTransformationFunction(query_name) {

		du.debug('Get Transformation Function');

		let transformation_function_filepath = this.getTransformationFunctionFilepath(query_name);

		return require(transformation_function_filepath);

	}

	//Technical Debt:  This does not allow for multi-account filters...
	appendAccount(parameters) {

		du.debug('Append Account');

		if (this.permissionutilities.areACLsDisabled() !== true && global.account !== '*') {

			parameters['account'] = [global.account];

		}

		return parameters;

	}

	appendPeriod(parameters, period) {

		du.debug('Append Period');

		parameters['period'] = period.name;

		return parameters;

	}

	appendCurrentQueueName(parameters, queue_name) {

		du.debug('Append Queue Name', parameters, queue_name);

		// This could be taken care-off elsewhere

		if (_.isArray(queue_name)) {
			parameters['current_queuename'] = queue_name;
		} else {
			parameters['current_queuename'] = `'${queue_name}'`;
		}

		return parameters;

	}

	appendQueueName(parameters, queuename) {

		du.debug('Append Queue Name', parameters, queuename);

		parameters['queuename'] = `'${queuename}'`;

		return parameters;

	}

	disableACLs() {

		du.debug('Disable ACLs');

		this.permissionutilities.disableACLs();

	}

	enableACLs() {

		du.debug('Disable ACLs');

		this.permissionutilities.enableACLs();

	}

};
