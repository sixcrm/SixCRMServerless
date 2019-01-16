
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class SQSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.sqsprovider = new SQSProvider();

	}

	purgeQueues() {
		return this.getQueueDefinitions().then((queue_definitions) => {

			let purge_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

				if (!_.has(queue_definition, 'QueueName')) {
					throw eu.getError('server', 'Queue definition lacks QueueName property');
				}

				let queue_name = this.resolveQueueName(queue_definition);
				let deadletter_queue_name = this.resolveQueueName(queue_definition, true);

				return () => this.sqsprovider.purgeQueue(queue_name).then(() => this.sqsprovider.purgeQueue(deadletter_queue_name));

			});

			return arrayutilities.serial(purge_queue_promises).then(() => {

				return 'Complete';

			});

		});

	}

	deployQueues() {
		let number_of_created_queues = 0;

		return this.getQueueDefinitions().then((queue_definitions) => {

			let create_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

				if (!_.has(queue_definition, 'QueueName')) {
					throw eu.getError('server', 'Queue definition lacks QueueName property');
				}

				let deadletter_queue_definition = this.createDeadLetterQueueDefinition(queue_definition);

				return () => this.createQueue(deadletter_queue_definition).then(() => {

					queue_definition = this.addQueueRedrivePolicy(queue_definition);
					queue_definition.QueueName = this.resolveQueueName(queue_definition);

					return this.createQueue(queue_definition).then((result) => {

						if (result == false) {
							du.info('Queue Exists');
						} else {
							du.info('Queue Created');
							number_of_created_queues++;
						}

						return true;

					});

				});

			});

			return arrayutilities.serial(create_queue_promises).then(() => {

				du.info('Pausing to allow AWS to catch up...');

				if (number_of_created_queues > 0) {
					return timestamp.delay(60000)().then(() => {
						return 'Complete';
					});
				} else {
					return 'Complete';
				}

			});

		});

	}

	createQueue(queue_definition) {
		return this.sqsprovider.createQueue(queue_definition);

	}

	destroyQueues() {
		return this.getQueueDefinitions().then((queue_definitions) => {

			let delete_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

				if (!_.has(queue_definition, 'QueueName')) {
					throw eu.getError('server', 'Queue definition lacks QueueName property');
				}

				let queue_name = this.resolveQueueName(queue_definition);
				let deadletter_queue_name = this.resolveQueueName(queue_definition, true);

				return () => this.sqsprovider.deleteQueue(queue_name).then(() => this.sqsprovider.deleteQueue(deadletter_queue_name));

			});

			return arrayutilities.serial(delete_queue_promises)
				.then(() => {

					du.info('Pausing to allow AWS to catch up...');

					return timestamp.delay(60000)().then(() => {
						return 'Complete';
					});

				});

		});

	}

	getQueueDefinitions() {
		let sqs_definitions_directory = global.SixCRM.routes.path('deployment', 'sqs/queues');

		return fileutilities.getDirectoryFiles(sqs_definitions_directory).then((queue_definition_filenames) => {

			let queue_definitions = arrayutilities.map(queue_definition_filenames, (queue_definition_filename) => {
				return global.SixCRM.routes.include('deployment', 'sqs/queues/' + queue_definition_filename);
			});

			return queue_definitions;

		});

	}

	addQueueRedrivePolicy(queue_definition) {
		let deadletter_queue_arn = this.sqsprovider.getQueueARN(this.resolveQueueName(queue_definition, true));

		queue_definition.Attributes.RedrivePolicy = JSON.stringify({
			deadLetterTargetArn: deadletter_queue_arn,
			maxReceiveCount: global.SixCRM.configuration.site_config.sqs.max_receive_count
		});

		return queue_definition;

	}

	createDeadLetterQueueDefinition(queue_definition) {
		let queue_definition_clone = objectutilities.clone(queue_definition);

		if (!_.has(queue_definition, 'QueueName')) {
			throw eu.getError('server', 'Queue definition lacks QueueName property');
		}

		queue_definition_clone.QueueName = this.resolveQueueName(queue_definition, true)

		return queue_definition_clone;

	}

	resolveQueueName(definition, isDeadLetter) {

		let queueName = definition.QueueName;

		if (isDeadLetter) {

			queueName += global.SixCRM.configuration.site_config.sqs.deadletter_postfix;

		}

		if (definition.Attributes.FifoQueue === 'true') {

			return queueName + '.fifo';

		} else {

			return queueName;

		}

	}

}
