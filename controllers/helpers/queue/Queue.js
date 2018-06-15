
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const sqs = new SQSProvider();

class Queue {

	static listMessages(queueName) {

		du.debug('Listing Messages');

		return sqs.receiveMessages({queue: queueName, limit: 10, visibilityTimeout: 0})
			.then((messages) => {

				if (_.isUndefined(messages) || _.isNull(messages) || !arrayutilities.nonEmpty(messages)) {
					return [];
				}

				return arrayutilities.map(messages, (message) => {
					return {id: message.MessageId, queue: queueName, message: message.Body};
				});

			});

	}

}

module.exports = Queue;
