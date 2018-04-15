const expect = require('chai').expect;
const SqsTestUtils = require('./sqs-test-utils');

describe('Confirms our helper tools can send and receive messages', function () {

	let aQueue = 'shipped';
	let aBody = '{id: 42}';
	let anotherBody = '{id: 43}';

	beforeEach((done) => {
		SqsTestUtils.purgeQueue(aQueue).then(() => {done()});
	});

	it('new queue should be empty', function() {
		return SqsTestUtils.messageCountInQueue(aQueue).then(count => {
			expect(count).to.equal(0);
		});
	});

	it('queue should contain one message after sending message to it', function() {
		return SqsTestUtils.sendMessageToQueue(aQueue, aBody).then(() => {
			return SqsTestUtils.messageCountInQueue(aQueue).then(count => {
				expect(count).to.equal(1);
			});
		});
	});

	it('you should be able to read a single message from a queue', function() {
		return SqsTestUtils.sendMessageToQueue(aQueue, aBody).then(() => {
			return SqsTestUtils.receiveMessageFromQueue(aQueue).then(message => {
				expect(message).to.equal(aBody);
			});
		});
	});

	it('you should be able to read messages from a queue one by one', function() {
		return SqsTestUtils.sendMessageToQueue(aQueue, aBody).then(() => {
			return SqsTestUtils.sendMessageToQueue(aQueue, anotherBody).then(() => {
				return SqsTestUtils.receiveMessageFromQueue(aQueue).then(message => {
					expect(message).to.equal(aBody);
					return SqsTestUtils.receiveMessageFromQueue(aQueue).then(message => {
						expect(message).to.equal(anotherBody);
					});
				});
			});
		});
	});

	it('queue should be empty after purging', function() {
		return SqsTestUtils.sendMessageToQueue(aQueue, aBody).then(() => {
			return SqsTestUtils.purgeQueue(aQueue).then(() => {
				return SqsTestUtils.messageCountInQueue(aQueue).then(count => {
					expect(count).to.equal(0);
				});
			});
		});
	});
});
