
const _ = require('lodash');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const WorkerResponse = global.SixCRM.routes.include('workers', 'components/WorkerResponse.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCompoundWorkerResponseMultipleMessages(response, messages){

	return {
		worker_response_object: getValidWorkerResponse(response),
		messages: messages
	};

}

function getValidCompoundWorkerResponse(response, message){

	return {
		worker_response_object: getValidWorkerResponse(response),
		message: message
	};

}

function getMultipleValidMessages(count) {

	let return_array = [];

	for (let i = 0; i < count || 0; i++) {
		return_array.push(getValidMessage());
	}

	return return_array;

}

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

function getValidWorkerResponse(response){

	return new WorkerResponse(response);

}

function getValidMockWorker(){

	let WorkerResponse = global.SixCRM.routes.include('workers', 'components/WorkerResponse.js');

	class aWorker {
		constructor(){

		}
		execute(){
			return Promise.resolve(new WorkerResponse('success'));
		}
	}

	return aWorker;

}

function getValidMessages(ids){

	ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(), uuidV4()]:ids;

	return arrayutilities.map(ids, id => getValidMessage(id));

}

describe('workers/forwardMessage', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('validateEnvironment', () => {

		it('fails when params are not set.', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			try {

				return forwardMessageController.validateEnvironment()

			} catch (error) {

				expect(error.message).to.equal('[500] Invalid Forward Message Configuration.');

			}

		});

		it('fails when origin queue is not set.', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			try{

				forwardMessageController.parameters.set('params', {name: 'dummy_name', workerfunction: 'dummy_function'});

			}catch(error){

				expect(error.message).to.have.string('[500] One or more validation errors occurred');

			}

		});

		it('fails when name is not set.', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			try{

				forwardMessageController.parameters.set('params', {origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});

			}catch(error){

				expect(error.message).to.have.string('[500] One or more validation errors occurred');

			}

		});

		it('fails when workerfunction is not set.', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			try{

				forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue'});

			}catch(error){

				expect(error.message).to.have.string('[500] One or more validation errors occurred');

			}

		});

		it('succeeds when params are proper.', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});

			return forwardMessageController.validateEnvironment().then(response => {
				expect(response).to.equal(true)
			})

		});

	});

	describe('getMessages', () => {

		it('successfully retrieves and sets messages from correct queue', () => {

			let valid_messages = getValidMessages();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages({queue}) {
					expect(queue).to.equal('dummy_queue');

					return Promise.resolve(valid_messages);
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});

			return forwardMessageController.getMessages().then(() => {
				let messages = forwardMessageController.parameters.get('messages');

				expect(messages).to.deep.equal(valid_messages);
				expect(forwardMessageController.parameters.get('messages')).to.deep.equal(valid_messages);
			});

		});

	});

	describe('validateMessages', () => {

		it('fails for invalid message container types', () => {

			let invalids = [{}, '', null, undefined, 123, new Error(), false, true];

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			arrayutilities.map(invalids, (invalid) => {

				try{

					forwardMessageController.validateMessages(invalid);

				}catch(error){

					expect(error.message).to.exist;

				}

			});

		});

		it('fails for invalid messages', () => {


			let valid_messages = getValidMessages();
			let invalids = [
				{},
				{
					"ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
					"MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
					"Body": "abc123"
				},
				{
					"MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
					"MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
					"Body": "abc123"
				},
				{
					"MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
					"ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
					"Body": "abc123"
				},
				{
					"MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
					"ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
					"MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9"
				}
			];

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			arrayutilities.map(invalids, (invalid) => {

				invalid = arrayutilities.merge(valid_messages, [invalid]);

				try{

					forwardMessageController.validateMessages(invalid);

				}catch(error){

					expect(error.message).to.exist;

				}

			});

		});

		it('succeeds for valid messages', () => {

			let valids = getValidMessages();

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('messages', valids);

			forwardMessageController.validateMessages().then(response => {
				expect(response).to.equal(true);
			})


		});

	});

	describe('invokeAdditionalLambdas', () => {

		it('fails when messages parameters is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					return true;
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});

			try {
				forwardMessageController.invokeAdditionalLambdas()
			} catch (error) {
				expect(error.message).to.have.string('[500] "messages" property is not set.');
			}

		});

		it('succeeds for valid messages of length less than limit', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					return true;
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();
			let valid_messages = getValidMessages();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});
			forwardMessageController.parameters.set('messages', valid_messages);

			return forwardMessageController.invokeAdditionalLambdas().then(() => {
				let messages = forwardMessageController.parameters.get('messages');

				expect(messages).to.deep.equal(valid_messages);
			});

		});

		it('succeeds for valid messages of length 0', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					expect.fail();
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});
			forwardMessageController.parameters.set('messages', []);

			return forwardMessageController.invokeAdditionalLambdas().then(() => {
				let messages = forwardMessageController.parameters.get('messages');

				expect(messages).to.deep.equal([]);
			});

		});

		it('succeeds for valid messages of length 10', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction( {function_name, payload, invocation_type} ) {
					expect(function_name).to.equal('lambda-name');
					expect(JSON.parse(payload)).to.deep.equal({});
					expect(invocation_type).to.equal('Event');

					return Promise.resolve(true);
				}

				buildLambdaName() {
					return 'lambda-name';
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();
			let messages = getMultipleValidMessages(10);

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});
			forwardMessageController.parameters.set('messages', messages);

			return forwardMessageController.invokeAdditionalLambdas().then(() => {
				let messages = forwardMessageController.parameters.get('messages');

				expect(messages).to.deep.equal(messages);
			});

		});

		it('fails when lambda returns error', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					let error = new Error();

					error.message = 'Testing Error.';
					return Promise.reject(error);
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_function'});
			forwardMessageController.parameters.set('messages', []);

			return forwardMessageController.invokeAdditionalLambdas().catch(error => {
				expect(error.message).to.equal('Testing Error.');
			});

		});

	});

	describe('forwardMessagesToWorkers', () => {

		it('succeeds for valid messages of length 0', () => {

			let mock_worker = getValidMockWorker();

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			let messages = [];

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'aWorker.js'});
			forwardMessageController.parameters.set('messages', messages);

			return forwardMessageController.forwardMessagesToWorkers().then(() => {
				let responses = forwardMessageController.parameters.get('workerresponses');

				expect(responses).to.deep.equal([]);
			});

		});

		it('succeeds for valid messages of length less than limit', () => {

			let mock_worker = getValidMockWorker();

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			let messages = getValidMessages();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'aWorker.js'});
			forwardMessageController.parameters.set('messages', messages);

			return forwardMessageController.forwardMessagesToWorkers().then(() => {
				let responses = forwardMessageController.parameters.get('workerresponses');

				expect(responses.length).to.equal(messages.length);

				arrayutilities.map(responses, response => {

					du.warning(response);
					expect(response).to.have.property('worker_response_object');
					let code = response.worker_response_object.getCode();

					expect(code).to.equal('success');
					expect(response).to.have.property('message');
					expect(response.message).to.have.property('ReceiptHandle');

				});

			});

		});

		it('succeeds for valid messages of length equal to limit', () => {

			let mock_worker = getValidMockWorker();

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'aWorker.js'});
			forwardMessageController.parameters.set('messages', messages);

			return forwardMessageController.forwardMessagesToWorkers().then(() => {
				let responses = forwardMessageController.parameters.get('workerresponses');

				expect(responses.length).to.equal(messages.length);
				arrayutilities.map(responses, response => {

					expect(response).to.have.property('worker_response_object');
					let code = response.worker_response_object.getCode();

					expect(code).to.equal('success');
					expect(response).to.have.property('message');
					expect(response.message).to.have.property('ReceiptHandle');

				});

			});

		});

		//Technical Debt:  Throw an error, see what happens
		xit('handles errors', () => {

			let mock_worker = getValidMockWorker();

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController({workerfunction: 'aWorker.js'});

			let messages = getValidMessages();

			return forwardMessageController.forwardMessagesToWorkers(messages).then(responses => {

				arrayutilities.map(responses, response => {

					expect(response).to.have.property('worker_response_object');
					expect(response.worker_response_object).to.have.property('response');
					expect(response.worker_response_object.response).to.have.property('code');
					expect(response.worker_response_object.response.code).to.equal('success');
					expect(response).to.have.property('message');
					expect(response.message).to.have.property('ReceiptHandle');

				});

			});

		});

		it('succeeds for when bulk is set', () => {

			let mock_worker = getValidMockWorker();

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'aWorker.js', bulk: true});
			forwardMessageController.parameters.set('messages', messages);

			return forwardMessageController.forwardMessagesToWorkers().then(() => {
				let responses = forwardMessageController.parameters.get('workerresponses');

				expect(responses.length).to.equal(1);

				arrayutilities.map(responses, response => {

					expect(response).to.have.property('worker_response_object');
					let code = response.worker_response_object.getCode();

					expect(code).to.equal('success');
					expect(response).to.have.property('messages');
					expect(response.messages.length).to.equal(messages.length);

					arrayutilities.map(response.messages, response_message => {
						expect(response_message).to.have.property('ReceiptHandle');
					})

				});

			});

		});

	});

	describe('respond', () => {

		//make sure the response has the original message in the body
		it('responds correctly when there are no messages', () => {

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			let RelayResponse = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relay_response = new RelayResponse('success');

			let response = forwardMessageController.respond('success');

			expect(response).to.deep.equal(relay_response);

		});

	});

	describe('handleFailure', () => {

		it('does not forward a object missing the failure property', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail()
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('does not forward when failure_queue property is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail()
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('decline', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully forwards to correct failure queue', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage({message_body, queue}) {
					let body = JSON.parse(validMessage.Body);

					body['referring_workerfunction'] = global.SixCRM.routes.path('workers', 'wf.js');

					expect(queue).to.equal('some_queue');
					expect(message_body).to.equal(JSON.stringify(body));

					return Promise.resolve({});
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('decline', validMessage);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			let forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', failure_queue: 'some_queue', workerfunction: 'wf.js'});

			return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

	});

	describe('handleSuccess', () => {

		it('does not forward a object missing the success property', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail()
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('decline', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', destination_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('does not forward when destination_queue property is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail()
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully forwards to destination queue', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage({message_body, queue}) {
					expect(queue).to.equal('some_success_queue');
					expect(message_body).to.equal(validMessage.Body);
					return Promise.resolve({});
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', validMessage);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', destination_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

	});

	describe('handleError', () => {

		it('does not forward a object missing the error property', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail();
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', error_queue: 'some_error_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('does not forward when error_queue property is not set', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail();
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('error', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController({});

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully forwards to error queue', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage({message_body, queue}) {
					let body = JSON.parse(validMessage.Body);

					body['referring_workerfunction'] = global.SixCRM.routes.path('workers', 'wf.js');

					expect(queue).to.equal('some_error_queue');
					expect(message_body).to.equal(JSON.stringify(body));

					return Promise.resolve({});
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('error', validMessage);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', error_queue: 'some_error_queue', workerfunction: 'wf.js'});

			return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

	});


	describe('handleNoAction', () => {

		it('does not forward a object missing the noaction property', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect.fail();
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleNoAction(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully handles noaction', () => {

			const compoundWorkerResponse = getValidCompoundWorkerResponse('noaction', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleNoAction(compoundWorkerResponse).then(response_object => {
				expect(response_object).to.deep.equal(compoundWorkerResponse);
			});

		});

	});

	describe('handleDelete', () => {

		it('does not delete noaction type', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage() {
					expect.fail();
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('noaction', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'dummy_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes fail type', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_delete_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('decline', validMessage);

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_delete_queue', workerfunction: 'dummy_worker'});


			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes success type', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_success_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', validMessage);
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes error type', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_error_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('error', validMessage);
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_error_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes success type with multiple messages', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_success_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', validMessage);
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes fail type with multiple messages', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_fail_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('decline', validMessage);
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_fail_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully deletes error type with multiple messages', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue, receipt_handle}) {
					expect(queue).to.equal('some_error_queue');
					expect(receipt_handle).to.equal(validMessage.ReceiptHandle);

					return Promise.resolve(true);
				}
			});

			const validMessage = getValidMessage();
			const compoundWorkerResponse = getValidCompoundWorkerResponse('error', validMessage);
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_error_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});

		it('successfully skips deletes for noaction type with multiple messages', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage() {
					expect.fail();
				}
			});

			const compoundWorkerResponse = getValidCompoundWorkerResponse('noaction', getValidMessage());
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_noaction_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
				expect(returned).to.deep.equal(compoundWorkerResponse);
			});

		});


	});

	describe('getCompoundWorkerResponseMessages', () => {

		it('retrieves messages for single message response', () => {
			const compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController({});
			const retrieved_messages = forwardMessageController.getCompoundWorkerResponseMessages(compoundWorkerResponse);

			expect(retrieved_messages).to.deep.equal([compoundWorkerResponse.message]);
		});

		it('retrieves messages for multi-message response', () => {
			const compoundWorkerResponse = getValidCompoundWorkerResponseMultipleMessages('success', getValidMessages());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController({});
			const retrieved_messages = forwardMessageController.getCompoundWorkerResponseMessages(compoundWorkerResponse);

			expect(retrieved_messages).to.deep.equal(compoundWorkerResponse.messages);
		});

	});

	describe('deleteMessages', () => {

		it('successfully deletes single message arrays', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue}) {
					expect(queue).to.equal('some_success_queue');

					return Promise.resolve(true);
				}
			});

			const messages = [getValidMessage()];
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.deleteMessages(messages).then(result => {
				expect(result).to.equal(true);
			});

		});

		it('successfully deletes multiple message arrays', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue}) {
					expect(queue).to.equal('some_success_queue');

					return Promise.resolve(true);
				}
			});

			const messages = getValidMessages();
			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.deleteMessages(messages).then(result => {
				expect(result).to.equal(true);
			});

		});

	});

	describe('handleWorkerResponseObject', () => {

		it('successfully handles a worker response', () => {

			let compound_worker_response_object = getValidCompoundWorkerResponse('success', getValidMessage());

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue}) {
					expect(queue).to.equal('some_success_queue');

					return Promise.resolve(true);
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});

			return forwardMessageController.handleWorkerResponseObject(compound_worker_response_object).then(result => {

				expect(result).to.equal(compound_worker_response_object);

			});

		});

	});
	describe('handleWorkerResponseObjects', () => {

		it('successfully handles a worker response objects', () => {

			let compound_worker_response_object = getValidCompoundWorkerResponse('success', getValidMessage());

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				deleteMessage({queue}) {
					expect(queue).to.equal('some_success_queue');

					return Promise.resolve(true);
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});
			forwardMessageController.parameters.set('workerresponses', [compound_worker_response_object]);

			return forwardMessageController.handleWorkerResponseObjects().then(result => {

				expect(result).to.deep.equal([compound_worker_response_object]);

			});

		});

	});

	describe('validateWorkerResponseObject', () => {

		it('successfully validates a worker response', () => {

			let compound_worker_response_object = getValidCompoundWorkerResponse('success', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});
			forwardMessageController.parameters.set('workerresponses', [compound_worker_response_object]);

			return forwardMessageController.validateWorkerResponseObject(compound_worker_response_object).then(result => {

				expect(result).to.equal(compound_worker_response_object);

			});

		});

		it('fails to validates a worker response', () => {

			let compound_worker_response_object = getValidCompoundWorkerResponse('decline', getValidMessage());

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'dummy_worker'});
			forwardMessageController.parameters.set('workerresponses', [compound_worker_response_object]);

			//any class that is not a WorkerResponse class
			let mock_dummy_class = class DummyClass{
				constructor(){}
			};

			compound_worker_response_object.worker_response_object = new mock_dummy_class;

			try {
				forwardMessageController.validateWorkerResponseObject(compound_worker_response_object)
			} catch (error) {
				expect(error.message).to.deep.equal('[500] Unrecognized worker response: ' + compound_worker_response_object);
			}
		});

	});

	describe('execute', () => {

		it('successful', () => {

			let messages = getValidMessages();

			let mock_worker = getValidMockWorker();

			let compound_worker_response_object = getValidCompoundWorkerResponse('success', getValidMessage());

			mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);

			//does not invoke additional lambda when not required
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					expect.fail();
				}
			});

			const ForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
			const forwardMessageController = new ForwardMessageController();

			forwardMessageController.sqsprovider = {
				receiveMessages: ({queue, limit}) => {
					expect(queue).to.equal('some_success_queue');
					expect(limit).to.equal(forwardMessageController.message_limit);

					return Promise.resolve(messages);
				},
				deleteMessage({queue, receipt_handle}) {

					expect(queue).to.equal('some_success_queue');
					expect(receipt_handle).to.equal(messages[0].ReceiptHandle);

					return Promise.resolve(true);
				}
			};

			forwardMessageController.parameters.set('params', {name: 'dummy_name', origin_queue: 'some_success_queue', workerfunction: 'aWorker.js'});
			forwardMessageController.parameters.set('workerresponses', [compound_worker_response_object]);
			forwardMessageController.parameters.set('messages', messages);

			let RelayResponse = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relay_response = new RelayResponse('success');

			return forwardMessageController.execute().then((result) => {
				expect(result).to.deep.equal(relay_response);
			});
		});

	});

	//technical debt:  Create a response object for worker controllers

});
