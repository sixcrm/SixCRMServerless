const chai = require('chai');
const expect = chai.expect;
const _ = require('lodash');
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const AWSTestUtils = require('./aws-test-utils');

describe('controllers/providers/sqs-provider', () => {

	let copy_stage = stringutilities.clone(process.env.stage);

	beforeEach(() => {
		// cleanup
		delete require.cache[require.resolve(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'))];
	});

	afterEach(() => {
		global.SixCRM.configuration.handleStage(copy_stage);
	});

	describe('getQueueARN', () => {

		it('successfully returns queue arn', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			let argumentation = {QueueName: 'sampleQueueName'};

			let queue_arn = sqsprovider.getQueueARN(argumentation);

			expect(queue_arn).to.match(/^arn:aws:sqs:us-[a-zA-Z]+-[0-9]:[0-9]+:sampleQueueName$/);

		});

		it('returns error when queue name does not exist', () => {

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			try{
				sqsprovider.getQueueARN({test: 'sample data'});
			}catch(error){
				expect(error.message).to.equal('[500] Missing QueueName property');
			}
		});

		it('returns error when argumentation for queueARN is not a string', () => {

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			try{
				sqsprovider.getQueueARN(1);
			}catch(error){
				expect(error.message).to.equal('[500] Improper argumentation for getQueueARN');
			}
		});

		it('returns queue arn template with appointed queue name for localhost', () => {

			let argumentation = {QueueName: 'sampleQueueName'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			global.SixCRM.configuration.handleStage('local');
			global.SixCRM.configuration.setConfigurationFiles();

			let queue_arn = sqsprovider.getQueueARN(argumentation);

			expect(queue_arn).to.equal(argumentation.QueueName);
		});
	});

	describe('getQueueURL', () => {

		it('returns queue url template with appointed queue name', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = 'example';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			expect(sqsprovider.getQueueURL(input)).to.match(/https:\/\/sqs.us-[a-zA-Z]+-[0-9].amazonaws.com\/[0-9]+\/example/);
		});

		it('returns url template with queue name from appointed input', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {queue:'example'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			expect(sqsprovider.getQueueURL(input)).to.match(/https:\/\/sqs.us-[a-zA-Z]+-[0-9].amazonaws.com\/[0-9]+\/example/);
		});

		it('returns localhost endpoint with appointed queue name', () => {

			global.SixCRM.configuration.handleStage('local');
			global.SixCRM.configuration.setConfigurationFiles();

			let endpoint = global.SixCRM.configuration.site_config.sqs.endpoint;
			let input = 'example';
			const queue = '/queue/';

			let expected_result = endpoint+queue+input;

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();
			let queue_url = sqsprovider.getQueueURL(input);

			expect(queue_url).to.equal(expected_result);

		});
	});

	describe('getQueueParameters', () => {

		it('returns error when queue name is undefined', () => {

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			try{
				sqsprovider.getQueueParameters();
			}catch(error){
				expect(error.message).to.equal('[500] Unable to determine queue name.');
			}
		});

		it('returns queue parameters with appointed queue name', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let queue_name = 'test';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			let queue_parameters = sqsprovider.getQueueParameters(queue_name);

			expect(queue_parameters.account).to.match(/[0-9]/);
			expect(queue_parameters.queue_name).to.equal(queue_name);
			expect(queue_parameters.region).to.match(/us-[a-zA-Z]+-[0-9]/);
		});
	});

	describe('ensureString', () => {

		it('returns string', () => {

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			expect(sqsprovider.ensureString(123)).to.equal('123');
		});

		it('returns unchanged value when value is string', () => {

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			expect(sqsprovider.ensureString('any_string_value')).to.equal('any_string_value');
		});
	});

	describe('receiveMessagesRecursive', () => {

		it('returns 200 messages', () => {

			let ten_messages = [];

			for(var i =0; i < 10; i++){
				ten_messages.push({
					Id: 'someid',
					ReceiptHandle:'SomeReceiptHandle'
				});
			}

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				receiveMessage: function(params, callback) {
					callback(null, {Messages: ten_messages})
				}
			};

			return sqsprovider.receiveMessagesRecursive({queue: 'testqueue'}).then(messages => {
				expect(messages.length).to.equal(200);
			});

		});


		it('obeys batch_read_limit', () => {
			let max = 50;
			let ten_messages = [];

			for(var i =0; i < 10; i++){
				ten_messages.push({
					Id: 'someid',
					ReceiptHandle:'SomeReceiptHandle'
				});
			}

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();


			sqsprovider.batch_read_limit = max;
			sqsprovider.sqs = {
				receiveMessage: function(params, callback) {
					if(_.has(params, 'MaxNumberOfMessages')){
						let return_messages = ten_messages.slice(0, parseInt(params.MaxNumberOfMessages));

						callback(null, {Messages: return_messages})
					}
					callback(null, {Messages: ten_messages})
				}
			};

			return sqsprovider.receiveMessagesRecursive({queue: 'testqueue'}).then(messages => {
				expect(messages.length).to.equal(max);
			});

		});

		it('obeys batch_read_limit less than 10', () => {
			let max = 5;

			let ten_messages = [];

			for(var i =0; i < 10; i++){
				ten_messages.push({
					Id: 'someid',
					ReceiptHandle:'SomeReceiptHandle'
				});
			}

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();


			sqsprovider.batch_read_limit = max;
			sqsprovider.sqs = {
				receiveMessage: function(params, callback) {
					if(_.has(params, 'MaxNumberOfMessages')){
						let return_messages = ten_messages.slice(0, parseInt(params.MaxNumberOfMessages));

						callback(null, {Messages: return_messages})
					}
					callback(null, {Messages: ten_messages})
				}
			};

			return sqsprovider.receiveMessagesRecursive({queue: 'testqueue'}).then(messages => {
				expect(messages.length).to.equal(max);
			});

		});

	});

	describe('receiveMessages', () => {

		it('returns received message', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let params = {
				queue:'example',
				limit: 5
			};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				receiveMessage: function(params, callback) {
					callback(null, {Messages: 'sample message'})
				}
			};

			return sqsprovider.receiveMessages(params).then((result) => {
				expect(result).to.equal('sample message');
			});
		});

		it('returns error when message wasn\'t received', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let params = {
				queue:'example',
				limit: 5
			};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				receiveMessage: function(params, callback) {
					callback(new Error('fail'), null)
				}
			};

			return sqsprovider.receiveMessages(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('deleteMessage', () => {

		it('successfully deletes message', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {queue:'example'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				deleteMessage: AWSTestUtils.AWSPromise('success')
			};

			return sqsprovider.deleteMessage(input).then((result) => {
				expect(result).to.equal('success');
			});
		});
	});

	describe('sendMessage', () => {

		it('successfully sends message', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {queue:'example'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				sendMessage: AWSTestUtils.AWSPromise('success')
			};

			return sqsprovider.sendMessage(input).then((result) => {
				expect(result).to.equal('success');
			});
		});
	});

	describe('deleteMessages', () => {

		it('successfully deletes messages', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {
				queue: 'example',
				messages: [{
					ReceiptHandle: 'sample message',
					MessageId: 1
				}]
			};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				deleteMessageBatch: (params, callback) => {
					callback(null, 'success');
				}
			};

			return sqsprovider.deleteMessages(input).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('returns response from deleted message batch', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {
				queue: 'example',
				messages: [{
					ReceiptHandle: 'sample message',
					MessageId: 1
				}]
			};

			let data = {Failed: ['failed message']};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				deleteMessageBatch: (params, callback) => {
					callback(null, data);
				}
			};

			return sqsprovider.deleteMessages(input).then((result) => {
				expect(result).to.equal(data);
			});
		});

		it('returns error when messages haven\'t been removed', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let fail = new Error('fail');

			let input = {
				queue: 'example',
				messages: [{
					ReceiptHandle: 'sample message',
					MessageId: 1
				}]
			};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				deleteMessageBatch: (params, callback) => {
					callback(fail, null);
				}
			};

			return sqsprovider.deleteMessages(input).catch((error) => {
				expect(error).to.equal(fail);
			});
		});

		it('returns false when there aren\'t any messages to delete', () => {

			global.SixCRM.configuration.handleStage('development');
			global.SixCRM.configuration.setConfigurationFiles();

			let input = {queue: 'example'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			return sqsprovider.deleteMessages(input).then((result) => {
				expect(result).to.equal(false);
			});
		});
	});

	describe('listQueues', () => {

		it('rejects when listing queues fails', () => {

			let params = 'test';

			let fail = {message: 'fail'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(fail, null);
				}
			};

			return sqsprovider.listQueues(params).catch((error) => {
				expect(error.message).to.equal('[500] ' + fail.message);
			});
		});

		it('returns queue list', () => {

			let params = 'test';

			let data = 'success';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				}
			};

			return sqsprovider.listQueues(params).then((result) => {
				expect(result).to.equal(data);
			});
		});
	});

	describe('createQueue', () => {

		it('returns false if queue alredy exists', () => {

			let params = {QueueName: 'test'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test', 'test2'];

			return sqsprovider.createQueue(params).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns response from AWS create queue', () => {

			let params = {QueueName: 'test'};

			let data = 'success';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test2'];

			sqsprovider.sqs = {
				createQueue: AWSTestUtils.AWSPromise(data)
			};

			return sqsprovider.createQueue(params).then((result) => {
				expect(result).to.equal(data);
			});
		});
	});

	describe('setQueueAttibutes', () => {

		it('returns response from AWS setQueueAttributes', () => {

			let data = 'success';

			let params = 'test';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				setQueueAttributes: AWSTestUtils.AWSPromise(data)
			};

			return sqsprovider.setQueueAttibutes(params).then((result) => {
				expect(result).to.equal(data);
			});
		});
	});

	describe('deleteQueue', () => {

		it('returns false if AWS reports error stating the queue does not exist', () => {

			let shortname = 'test';

			let data = {QueueUrls: []};

			//let fail = {code: 'AWS.SimpleQueueService.NonExistentQueue'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				}
			};

			return sqsprovider.deleteQueue(shortname).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns false if queue already does not exist', () => {

			let shortname = 'test';

			let data = {QueueUrls: ['test', 'test2']};

			let fail = {code: 'AWS.SimpleQueueService.NonExistentQueue'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				},
				deleteQueue: (params, callback) => {
					callback(fail, null);
				}
			};

			return sqsprovider.deleteQueue(shortname).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('rejects with AWS response when error was unrecognized', () => {

			let shortname = 'test';

			let data = {QueueUrls: ['test', 'test2']};

			let fail = {code: 'AWS.SimpleQueueService.SomeOtherError'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				},
				deleteQueue: (params, callback) => {
					callback(fail, null);
				}
			};

			return sqsprovider.deleteQueue(shortname).catch((error) => {
				expect(error.message).to.equal('[500] Failed to delete queue: test');
			});
		});

		it('returns response from AWS deleteQueue when deletion was successful', () => {

			let response = 'success';

			let shortname = 'test';

			let data = {QueueUrls: ['test', 'test2']};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				},
				deleteQueue: (params, callback) => {
					callback(null, response);
				}
			};

			return sqsprovider.deleteQueue(shortname).then((result) => {
				expect(result).to.equal('success');
			});
		});
	});

	describe('purgeQueue', () => {

		it('returns response from AWS purgeQueue', () => {

			let params = 'test';

			let data ='queue purged';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test', 'test2'];

			sqsprovider.sqs = {
				purgeQueue: AWSTestUtils.AWSPromise(data)
			};

			return sqsprovider.purgeQueue(params).then((result) => {
				expect(result).to.equal(data);
			});
		});

		it('returns false when appointed value is object with non-existing queue name', () => {

			let params = {QueueName: 'a_name'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test2'];

			return sqsprovider.purgeQueue(params).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns false when queue doesn\'t exist', () => {

			let params = 'test';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test2'];

			return sqsprovider.purgeQueue(params).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns error when queue name is not defined in parameters', () => {

			let params = {test: 'test'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test', 'test2'];

			return sqsprovider.purgeQueue(params).catch((error) => {
				expect(error.message).to.equal('[500] Purge Queue parameters objects assumed to have QueueName property');
			});
		});
	});

	describe('queueExists', () => {

		it('returns false when there aren\'t preexisting queues', () => {

			let shortname = 'sample name';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			delete sqsprovider.existing_queues;

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, 'no list');
				}
			};

			return sqsprovider.queueExists(shortname).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns error when unexpected response is received from AWS ListQueues', () => {

			let shortname = 'test';

			let data = {QueueUrls: 'queue'};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			delete sqsprovider.existing_queues;

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				}
			};

			return sqsprovider.queueExists(shortname).catch((error) => {
				expect(error.message).to.equal('[500] Unexpected response format from AWS ListQueues.');
			});
		});

		it('returns true when queue exist in retrieved list', () => {

			let short_name = 'test';

			let data = {QueueUrls: ['test', 'test2']};

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.sqs = {
				listQueues: (params, callback) => {
					callback(null, data);
				}
			};

			return sqsprovider.queueExists(short_name).then((result) => {
				expect(result).to.equal(true);
			});
		});

		it('returns true when queue is contained inside preexisting list', () => {

			let shortname = 'test';

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
			const sqsprovider = new SQSProvider();

			sqsprovider.existing_queues = ['test', 'test2'];

			return sqsprovider.queueExists(shortname).then((result) => {
				expect(result).to.equal(true);
			});
		});
	});
});
