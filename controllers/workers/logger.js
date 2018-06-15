const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const compressionutilities = require('@sixcrm/sixcrmcore/util/compression-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

module.exports = class LoggerController {

	constructor() {

		this.elasticsearch_endpoint = process.env.elasticsearch_endpoint;

	}

	processLog(input) {

		du.debug('Process Log');

		return Promise.resolve()
			.then(() => this.unpackData(input))
			.then((unpacked_data) => this.transformData(unpacked_data))
			.then((transformed_data) => this.postData(transformed_data))
			.then((result) => this.transformResponse(result))
			.catch((error) => {
				if (error.name == 'Control Error') {
					return Promise.resolve(true);
				} else {
					du.error('server', error);
					return Promise.reject(error);
				}
			});

	}

	unpackData(input) {

		du.debug('Unpack Data');

		let zipped_data = new Buffer(input.awslogs.data, 'base64');

		return compressionutilities.gunzip(zipped_data).then((unzipped_data) => JSON.parse(unzipped_data));

	}

	transformData(data) {

		du.debug('Transform Data');

		if (data.messageType === 'CONTROL_MESSAGE') {
			throw eu.getError('control', 'Control Message');
		}

		let bulkRequestBody = [];

		arrayutilities.map(data.logEvents, (logEvent) => {

			let indexName = global.SixCRM.configuration.site_config.elasticsearch.index_name;

			try {

				let event = JSON.parse(logEvent.extractedFields.event);
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

			} catch (ex) {

				du.warning('Could not parse log', logEvent.extractedFields.event);

			}

		});

		return bulkRequestBody;

	}

	postData(transformed_data) {

		du.debug('Post Data');

		let esClient = new elasticsearch.Client({
			host: this.elasticsearch_endpoint,
			connectionClass: require('http-aws-es')
		})

		return esClient.bulk({
			body: transformed_data
		});

	}

	transformResponse(response) {

		du.debug('Transform Response');

		if (response.errors) {

			const failedItems = _.filter(response.items, (item) => _.has(item, 'error'));

			if (failedItems.length > 0) {

				du.error("Failed Items", failedItems);

			}

			throw eu.getError('server', "Failed to index logs", failedItems);

		}

	}

}
