

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const WorkerResponse = global.SixCRM.routes.include('workers', 'components/WorkerResponse.js');

function getValidParams(){

	return {
		name: 'somename',
		origin_queue:'test',
		workerfunction: 'someworkerfunction'
	};

}

function getValidMessages(){
	return [
		{
			MessageId: "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
			ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
			MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
			Body: JSON.stringify({id: uuidV4()})
		},
		{
			MessageId: "fa969951-ae5f-4ff9-8b1b-1085a407f0cd",
			ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
			MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
			Body: JSON.stringify({id: uuidV4()})
		}
	];
}

function getValidWorkerResponse(response){

	return new WorkerResponse(response);

}

function getValidCompoundWorkerResponse(response, message){

	return {
		worker_response_object: getValidWorkerResponse(response),
		message: message
	};

}

describe('controllers/workers/components/relay.js', function () {

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


	describe('constructor', () => {

		it('successfully constructs', () => {

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			expect(objectutilities.getClassName(relayController)).to.equal('RelayController');

		});

	});

	describe('validateEnvironment', () => {

		it('throws error when forward message configuration is invalid', () => {

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			try {
				relayController.validateEnvironment();
			}catch(error) {
				expect(error.message).to.equal('[500] Invalid Forward Message Configuration.');
			}

		});

		it('checks whether required params are successfully set', () => {

			let params = getValidParams();

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.parameters.set('params', params);

			return relayController.validateEnvironment().then((results) => {
				expect(results).to.be.true;
			});
		});

	});

	describe('getMessages', () => {

		it('successfully gets messages from a queue', () => {

			let messages = getValidMessages();
			let params = getValidParams();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				receiveMessages() {
					return Promise.resolve(messages);
				}
			});

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.parameters.set('params', params);

			return relayController.getMessages().then(() => {
				let results = relayController.parameters.get('messages');

				expect(results).to.deep.equal(messages);

			});

		});

		it('successfully gets messages from a custom data source', () => {

			let messages = getValidMessages();
			let datasource = () => { return Promise.resolve(messages); }

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.message_acquisition_function = datasource;

			return relayController.getMessages().then(results => {

				expect(results).to.deep.equal(messages);

			});

		});

	});

	describe('getReceiptHandle', () => {

		it('returns receipt handle when such exists in message', () => {

			let messages = getValidMessages();

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			expect(relayController.getReceiptHandle(messages[0])).to.equal(messages[0].ReceiptHandle);

		});

		it('throws error when message does not have a receipt handle', () => {

			let messages = getValidMessages();

			delete messages[0].ReceiptHandle;

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			try{
				relayController.getReceiptHandle(messages[0]);
			}catch(error){
				expect(error.message).to.equal('[500] Message does not have a receipt handle.');
			}

		});

	});

	describe('validateMessages', () => {

		it('successfully validates messages', () => {

			let messages = getValidMessages();

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.parameters.set('messages', messages);

			return relayController.validateMessages().then(() => {
				let results = relayController.parameters.get('messages');

				expect(results).to.equal(messages);
			});
		});

	});

	describe('invokeAdditionalLambdas', () => {

		it('does not invoke additional lambda when not required', () => {
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/lambda-provider.js'), class {
				invokeFunction() {
					expect.fail();
				}
			});

			let messages = getValidMessages();
			let params = getValidParams();

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.parameters.set('params', params);
			relayController.parameters.set('messages', messages);

			return relayController.invokeAdditionalLambdas().then(() => {
				let results = relayController.parameters.get('messages');

				expect(results).to.deep.equal(messages);
			});
		});

	});

	describe('respond', () => {

		it('returns valid relay response', () => {

			let relayResponse = getValidWorkerResponse('noaction');

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			// send valid response type;
			let result = relayController.respond('noaction');

			expect(result.response_types).to.deep.equal(relayResponse.merged_response_types);
			expect(result.response).to.deep.equal(relayResponse.response_types.noaction);
		});

		it('throws error when response type does not exist', () => {

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			// send non existing response type;
			try{
				relayController.respond('invalid response type');
			}catch (error) {
				expect(error.message).to.equal('[500] Unexpected Response Type: "invalid response type".');
			}
		});

	});

	describe('pushMessagetoQueue', () => {

		it('successfully pushes message to queue', () => {

			let messages = getValidMessages();

			let params = {body: messages[0].Body, queue: 'a_queue'};

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.sqsprovider = {
				sendMessage: function({message_body: body, queue: queue}) {
					expect(body).to.deep.equal(params.body);
					expect(queue).to.equal(params.queue);

					return Promise.resolve(null);
				}
			};

			return relayController.pushMessagetoQueue(params).then((results) => {
				expect(results).to.equal(null);
			});
		});

		it('throws error when message sending failed', () => {

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.sqsprovider = {
				sendMessage: function({message_body: body, queue: queue}) {
					expect(body).to.equal(undefined);
					expect(queue).to.equal(undefined);

					return Promise.reject(new Error('fail'));
				}
			};

			//send without parameters
			return relayController.pushMessagetoQueue({}).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});

	});

	describe('deleteMessage', () => {

		it('successfully deletes message', () => {

			let messages = getValidMessages();

			let params = {queue: 'a_queue', receipt_handle: messages[0].ReceiptHandle};

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.sqsprovider = {
				deleteMessage: function({queue: queue, receipt_handle: receipt_handle}) {
					expect(queue).to.equal(params.queue);
					expect(receipt_handle).to.equal(params.receipt_handle);

					return 'message deleted';
				}
			};

			expect(relayController.deleteMessage(params)).to.equal('message deleted');
		});

		it('throws error when message is not removed', () => {

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.sqsprovider = {
				deleteMessage: function({queue: queue, receipt_handle: receipt_handle}) {
					expect(receipt_handle).to.equal(undefined);
					expect(queue).to.equal(undefined);

					throw new Error('fail');
				}
			};

			try {
				relayController.deleteMessage({})
			} catch (error) {
				expect(error.message).to.equal('fail');
			}
		});

	});

	describe('createDiagnosticMessageBody', () => {

		it('creates diagnostic message body', () => {

			let messages = getValidMessages();

			let compound_worker = getValidCompoundWorkerResponse('success', messages[0]);

			let params = getValidParams();

			const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');
			let relayController = new RelayController();

			relayController.parameters.set('params', params);

			let response = relayController.createDiagnosticMessageBody(compound_worker);

			expect(JSON.parse(response).id).to.deep.equal(JSON.parse(messages[0].Body).id);
			expect(JSON.parse(response).referring_workerfunction).to.defined;

		});

	});

});
