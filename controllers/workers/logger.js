const _ = require('lodash');
const elasticsearch = require('elasticsearch');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const compressionutilities = global.SixCRM.routes.include('lib', 'compression-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class LoggerController {

	constructor() {

		this.elasticsearch_endpoint = process.env.elasticsearch_endpoint;

	}

	processLog(input) {

		du.debug('Process Log');

		return Promise.resolve()
			.then(() => this.validateData(input))
			.then(() => this.unpackData(input))
			.then((unpacked_data) => this.transformData(unpacked_data))
			.then((transformed_data) => this.postData(transformed_data))
			.then((result) => this.transformResponse(result))
			.catch((error) => {
				if (error.name == 'Control Error') {
					return Promise.resolve(true);
				} else {
					return Promise.reject(error);
				}
			});

	}

	validateData(input) {

		du.debug('Validate Data');

		if (!objectutilities.hasRecursive(input, 'awslogs.data')) {
			throw eu.getError('server', 'Invalid data.');
		}

		stringutilities.isString(input.awslogs.data, true);

		return true;

	}

	unpackData(input) {

		du.debug('Unpack Data');

		let zipped_data = new Buffer(input.awslogs.data, 'base64');

		return compressionutilities.gunzip(zipped_data).then((unzipped_data) => stringutilities.parseJSONString(unzipped_data));

	}

	transformData(data) {

		du.debug('Transform Data');

		if (data.messageType === 'CONTROL_MESSAGE') {
			throw eu.getError('control', 'Control Message');
		}

		let bulkRequestBody = [];

		arrayutilities.map(data.logEvents, (logEvent) => {

			let indexName = global.SixCRM.configuration.site_config.elasticsearch.index_name;

			const source = this.buildSource(logEvent.message, logEvent.extractedFields);
			let event = source.event;
			event.id = logEvent.id;
			event.owner = data.owner;
			event.log_group = data.logGroup;
			event.log_stream = data.logStream;

			let action = {
				'index': {
					'_index': indexName,
					'_type': '_doc',
					'_id': logEvent.id
				}
			};

			bulkRequestBody.push(action);
			bulkRequestBody.push(event);

		});

		return bulkRequestBody;

	}

	buildSource(message, extracted_fields) {

		du.debug('Build Source');

		if (!_.isUndefined(extracted_fields) && !_.isNull(extracted_fields)) {
			return this.processExtractedFields(extracted_fields);
		}

		let json_substring = stringutilities.extractJSON(message);
		if (json_substring !== null) {
			return stringutilities.parseJSONString(json_substring);
		}

		return {};

	}

	processExtractedFields(extracted_fields) {

		du.debug('Process Extracted Fields');

		let return_object = {};

		objectutilities.map(extracted_fields, (key) => {

			let value = extracted_fields[key];

			if (stringutilities.isNumeric(value)) {

				return_object[key] = stringutilities.toNumeric(value);

			} else {

				value = value.trim();

				let json_substring = stringutilities.extractJSON(value);

				if (json_substring !== null) {
					return_object['$' + key] = stringutilities.parseJSONString(json_substring);
				}

				return_object[key] = value;

			}

		});

		return return_object;

	}

	postData(transformed_data) {

		du.debug('Post Data');

		let esClient = new elasticsearch.Client({
			host: this.elasticsearch_endpoint,
			connectionClass: require('http-aws-es')
		})

		return esClient.bulk({ body: transformed_data });

	}

	transformResponse(response) {

		du.debug('Transform Response');

		if (response.errors) {

			const failedItems = _.filter(response.items, (item) => _.has(item, 'error'));

			if (failedItems.length > 0) {

				du.error("Failed Items", failedItems);

			}

			throw eu.getError('server', "Failed to index logs", failedItems);

		} else {

			return true;

		}

	}

}
