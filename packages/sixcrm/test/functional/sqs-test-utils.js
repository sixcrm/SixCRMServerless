const request = require('supertest');

class SqsTestUtils {

	constructor() {
		this.baseUrl = `${global.SixCRM.configuration.site_config.sqs.endpoint}/`;
		this.queuePrefix = 'queue';
		this.queueNames = ['bill', 'recover', 'hold', 'pending', 'shipped', 'delivered'];
	}

	/**
     * Send a message to a queue, N times.
     *
     * @param queue Where to send.
     * @param body  What to send.
     * @param count How many times to send (the same message).
     * @returns {Promise.<T>}
     */
	sendMessageToQueue(queue, body, count) {
		if (count === 0) {
			return Promise.resolve();
		}

		if (!count) {
			count = 1;
		}

		let messages =[];

		for (let i = 0; i < count; i++) {
			messages.push(this.executeQuery(queue, 'Action=SendMessage&MessageBody=' + encodeURIComponent(body)))
		}

		return Promise.all(messages);
	}

	purgeQueue(queue) {
		return this.executeQuery(queue, 'Action=PurgeQueue');
	}

	purgeAllQueues() {
		let queues = [];

		this.queueNames.map((queue) => {
			queues.push(queue);
			queues.push(queue + '_error');
			queues.push(queue + '_failed');
		});

		return Promise.all(queues.map(queue => this.purgeQueue(queue)));
	}

	messageCountInQueue(queue) {
		let query = 'Action=GetQueueAttributes' +
            '&AttributeName.1=ApproximateNumberOfMessages' +
            '&AttributeName.2=ApproximateNumberOfMessagesNotVisible' +
            '&AttributeName.3=ApproximateNumberOfMessagesDelayed';

		// Return the sum of all 3 attributes.
		return this.executeQuery(queue, query).then(res => {
			let text = res.text;
			let regexp = /<Value>(\d*)<\/Value>/g;
			let result = 0;

			let match = regexp.exec(text);

			while (match !== null) {
				result += Number(match[1]);
				match = regexp.exec(text);
			}

			// console.log(`${queue}: ${result}`);
			return result;
		});
	}

	receiveMessageFromQueue(queue) {
		return this.executeQuery(queue, 'Action=ReceiveMessage&AttributeName=All').then(res => {
			let bodies = res.text.match(/<Body>(.*)<\/Body>/);

			return bodies ? bodies[1].replace(/&quot;/g,'"') : null;
		});
	}

	executeQuery(queueName, queryString) {
		return request(this.baseUrl).get(`${this.queuePrefix}/${queueName}?${queryString}`);
	}
}

module.exports = new SqsTestUtils();