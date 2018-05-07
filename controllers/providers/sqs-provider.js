
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class SQSProvider extends AWSProvider {

	constructor() {

		super();

		this.deadletter_postfix = '_deadletter';
		this.queue_url_template = 'https://sqs.{{region}}.amazonaws.com/{{account}}/{{queue_name}}';
		this.queue_arn_template = 'arn:aws:sqs:{{region}}:{{account}}:{{queue_name}}';

		this.batch_read_limit = 200;

	}

	instantiateSQS() {

		du.debug('Instantiate SQS');

		let region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'sqs.region')) ? global.SixCRM.configuration.site_config.sqs.region : this.getRegion();

		let parameters = {
			region: region
		};

		if (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'sqs.endpoint')) {
			parameters.endpoint = global.SixCRM.configuration.site_config.sqs.endpoint;
		}

		this.instantiateAWS();

		this.sqs = new this.AWS.SQS(parameters);

	}

	getQueueARN(queue_name) {

		du.debug('Get Queue ARN');

		if (_.isObject(queue_name)) {
			if (_.has(queue_name, 'QueueName')) {
				queue_name = queue_name.QueueName;
			} else {
				throw eu.getError('server', 'Missing QueueName property');
			}
		}

		if (!_.isString(queue_name)) {
			throw eu.getError('server', 'Improper argumentation for getQueueARN');
		}

		if (global.SixCRM.configuration.site_config.sqs.region === 'localhost') {
			return queue_name;
		}

		let parameters = this.getQueueParameters(queue_name);

		return parserutilities.parse(this.queue_arn_template, parameters);

	}

	getQueueURL(input) {

		let queue_name = null;

		if (_.isString(input)) {
			queue_name = input;
		} else if (_.isObject(input)) {
			if (_.has(input, 'queue') && _.isString(input.queue)) {
				queue_name = input.queue;
			}
		}

		if (global.SixCRM.configuration.site_config.sqs.region === 'localhost') {
			return global.SixCRM.configuration.site_config.sqs.endpoint + '/queue/' + queue_name;
		}

		let parameters = this.getQueueParameters(queue_name);

		return parserutilities.parse(this.queue_url_template, parameters);

	}

	getQueueParameters(queue_name) {

		du.debug('Get Queue Parameters');

		if (_.isNull(queue_name) || _.isUndefined(queue_name)) {
			throw eu.getError('server', 'Unable to determine queue name.');
		}

		let parameters = {
			'region': this.getRegion(),
			'account': global.SixCRM.configuration.site_config.aws.account,
			'queue_name': queue_name
		};

		return parameters;

	}

	receiveMessagesRecursive(parameters, options = {}) {

		du.debug('Receive Messages Recursive');

		const self = this;

		return _receiveMessagesRecursive(parameters, 0);

		function _receiveMessagesRecursive(parameters, count) {

			const parametersClone = _.clone(parameters);
			const returnMessages = [];

			if (self.batch_read_limit < 10) {

				parametersClone.limit =
					parametersClone.limit !== undefined && parametersClone.limit < 10 ?
						parametersClone.limit :
						self.batch_read_limit;

			}

			return self.receiveMessages(parametersClone).then((messages) => {

				returnMessages.push(...messages);
				count += messages.length;
				const messagesRemaining = self.batch_read_limit - count;
				const delegate = options.delegate ? options.delegate : () => Promise.resolve();

				return delegate(messages)
					.then(() => {

						if (messages.length === 10 && messagesRemaining > 0) {

							parametersClone.limit = messagesRemaining > 10 ? 10 : messagesRemaining;

							return _receiveMessagesRecursive(parametersClone, count).then(messages => {

								returnMessages.push(...messages);

								return returnMessages;

							});

						} else {

							return returnMessages;

						}

					})

			});

		}

	}

	receiveMessages(parameters) {

		du.debug('Receive Messages');

		return new Promise((resolve, reject) => {

			let params = {};

			let queue_url = this.getQueueURL(parameters);

			params['QueueUrl'] = queue_url;

			if (_.has(parameters, 'limit')) {
				params['MaxNumberOfMessages'] = parameters['limit'];
			} else {
				params['MaxNumberOfMessages'] = 10;
			}

			if (_.has(parameters, 'visibilityTimeout')) {
				params['VisibilityTimeout'] = parameters['visibilityTimeout'];
			}

			du.debug('Message parameters', params);

			this.assureSQS();

			this.sqs.receiveMessage(params, function (error, data) {

				if (error) {

					return reject(error);

				} else {

					let messages = [];

					if (_.has(data, 'Messages')) {

						messages = data.Messages;
					}

					return resolve(messages);

				}

			});

		});

	}

	deleteMessages(parameters) {

		return new Promise((resolve, reject) => {

			let entries = [];

			du.debug('Messages to delete:', parameters);

			if (_.has(parameters, 'messages')) {
				parameters.messages.forEach((message) => {
					du.debug('Message to delete:', message);
					if (_.has(message, 'ReceiptHandle') && _.has(message, 'MessageId')) {
						entries.push({
							Id: message.MessageId,
							ReceiptHandle: message.ReceiptHandle
						});
					}
				});
			}

			if (entries.length > 0) {

				let params = {
					Entries: entries
				};

				let queue_url = this.getQueueURL(parameters);

				params['QueueUrl'] = queue_url;

				du.debug('Delete message parameters:', params);

				this.assureSQS();

				this.sqs.deleteMessageBatch(params, function (err, data) {

					if (err) {

						du.warning(err);

						return reject(err)

					} else {

						if (_.has(data, 'Failed') && _.isArray(data.Failed) && data.Failed.length > 0) {
							du.warning('Failed to delete messages: ', data.Failed);
						}

						du.debug('Delete response: ', data);

						return resolve(data);
					}

				});

			} else {

				du.warning('No messages to delete.  Might want to check functional usage.');

				return resolve(false);

			}

		});

	}

	deleteMessage(parameters) {

		du.debug('Delete Message');

		return new Promise((resolve) => {

			let queue_url = this.getQueueURL(parameters);

			var params = {
				QueueUrl: queue_url,
				ReceiptHandle: parameters.receipt_handle
			};

			this.assureSQS();

			this.sqs.deleteMessage(params, (error, data) => {
				return resolve(this.AWSCallback(error, data))
			});

		});

	}

	sendMessage(parameters) {

		du.debug('Send Message');

		return new Promise((resolve) => {

			let queue_url = this.getQueueURL(parameters);

			var params = {
				MessageBody: this.ensureString(parameters.message_body),
				QueueUrl: queue_url
			};

			if (!queue_url.includes('.fifo')) {

				params.DelaySeconds = 30;

			}

			if (parameters.messageGroupId) {

				params.MessageGroupId = parameters.messageGroupId;

			}

			du.debug('Sending message', params);

			this.assureSQS();

			this.sqs.sendMessage(params, (error, data) => {
				resolve(this.AWSCallback(error, data))
			});

		});

	}

	purgeQueue(parameters) {

		du.debug('Purge Queue');

		return new Promise((resolve) => {

			let queue_name;

			if (_.isString(parameters)) {

				queue_name = parameters;

			} else {

				if (!_.has(parameters, 'QueueName')) {
					throw eu.getError('server', 'Purge Queue parameters objects assumed to have QueueName property');
				}

				queue_name = parameters.QueueName;

			}

			return this.queueExists(queue_name).then(queue_exists => {

				if (queue_exists) {

					du.debug('Queue exists, purging');

					let queue_url = this.getQueueURL(parameters);

					let params = {
						QueueUrl: queue_url
					};

					this.assureSQS();

					return this.sqs.purgeQueue(params, (error, data) => {

						du.info(queue_name + ' queue purged');

						return resolve(this.AWSCallback(error, data))

					});

				} else {

					du.debug('Queue not found, skipping');

					return resolve(false);

				}

			});

		});

	}

	createQueue(params) {

		du.debug('Create Queue', params);

		return new Promise((resolve) => {

			du.warning(params.QueueName);

			// Locally SQS does not support FIFO
			// This is really ugly, but at least its isolated to one place
			if (global.SixCRM.configuration.isLocal() && params.Attributes.FifoQueue === 'true') {

				delete params.Attributes.FifoQueue;
				delete params.Attributes.ContentBasedDeduplication;
				params.QueueName = params.QueueName.replace('.fifo', '');

				if (params.Attributes.RedrivePolicy && params.Attributes.RedrivePolicy) {

					params.Attributes.RedrivePolicy = params.Attributes.RedrivePolicy.replace('.fifo', '');

				}

			}

			return this.queueExists(params.QueueName).then(queue_exists => {

				if (queue_exists) {

					du.info('Queue exists, skipping');

					return resolve(false);

				} else {

					du.info('Queue not found, creating', params);

					this.assureSQS();

					return this.sqs.createQueue(params, (error, data) => {
						return resolve(this.AWSCallback(error, data));
					});

				}

			});

		});

	}

	setQueueAttibutes(params) {

		du.debug('Set Queue Attrbutes', params);

		return new Promise((resolve) => {

			this.assureSQS();

			this.sqs.setQueueAttributes(params, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	queueExists(shortname, refresh) {

		du.debug('Queue Exists');

		if (_.isUndefined(refresh)) {
			refresh = false;
		}

		if (!_.has(this, 'existing_queues') || refresh == true) {

			return this.listQueues().then((queues) => {

				du.info(queues);
				if (!_.has(queues, 'QueueUrls')) {

					this.existing_queues = [];

					return Promise.resolve(false);

				}

				if (!_.isArray(queues.QueueUrls)) {
					return Promise.reject(eu.getError('server', 'Unexpected response format from AWS ListQueues.'));
				}

				let existing_queues = queues.QueueUrls.map(queue_url => {
					return queue_url.substr((queue_url.lastIndexOf('/') + 1), queue_url.length);
				});

				this.existing_queues = existing_queues;

				return (_.includes(this.existing_queues, shortname));

			});

		} else {

			return Promise.resolve((_.includes(this.existing_queues, shortname)));

		}


	}

	listQueues(params) {

		du.debug('List Queues');

		return new Promise((resolve, reject) => {

			if (_.isUndefined(params) || !_.isObject(params)) {
				params = {};
			}

			this.assureSQS();

			this.sqs.listQueues(params, function (error, data) {

				if (error) {
					return reject(eu.getError('server', error.message));
				}

				return resolve(data);

			});

		});

	}

	deleteQueue(shortname) {

		du.debug('Delete Queue');

		du.warning('Deleting queue: ' + shortname);

		return this.queueExists(shortname, true).then(queue_exists => {

			return new Promise((resolve, reject) => {

				if (queue_exists) {

					let queue_url = this.getQueueURL(shortname);

					let parameters = {
						QueueUrl: queue_url
					};

					this.assureSQS();

					this.sqs.deleteQueue(parameters, (error, data) => {

						if (error) {

							if (error.code === 'AWS.SimpleQueueService.NonExistentQueue') {

								du.warning('Failed to delete queue (does not exist): ' + shortname);

								return resolve(false);

							}

							return reject(eu.getError('server', 'Failed to delete queue: ' + shortname));

						} else {

							du.debug(shortname + ' queue successfully deleted.');

							return resolve(data);

						}

					});

				} else {

					du.warning('Queue does not exist: ' + shortname);

					return resolve(false);

				}

			});


		});

	}

	ensureString(value) {
		if (_.isString(value)) {
			return value;
		}

		return JSON.stringify(value);
	}

	assureSQS() {

		if (!_.has(this, 'sqs')) {
			this.instantiateSQS();
		}

	}

}
