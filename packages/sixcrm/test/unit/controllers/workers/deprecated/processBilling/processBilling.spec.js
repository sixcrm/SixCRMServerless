
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidProcessorResponse() {

	return {
		code: 'success',
		message: 'Success',
		result: {
			response: '1',
			responsetext: 'SUCCESS',
			authcode: '123456',
			transactionid: '3448894418',
			avsresponse: 'N',
			cvvresponse: '',
			orderid: '',
			type: 'sale',
			response_code: '100'
		}
	};

}

function getValidTransaction() {
	return MockEntities.getValidTransaction();
}

function getValidRegisterResponse() {

	const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');

	return new RegisterResponse({
		response_type: 'success',
		transaction: getValidTransaction(),
		processor_response: getValidProcessorResponse()
	});

}

function getValidMessages() {

	return [{
		MessageId: "someMessageID",
		ReceiptHandle: "SomeReceiptHandle",
		Body: JSON.stringify({
			id: uuidV4()
		}),
		MD5OfBody: "SomeMD5"
	},
	{
		MessageId: "someMessageID",
		ReceiptHandle: "SomeReceiptHandle",
		Body: JSON.stringify({
			id: uuidV4()
		}),
		MD5OfBody: "SomeMD5"
	}
	];

}

function getValidRebill() {
	return MockEntities.getValidRebill();
}

xdescribe('controllers/workers/processBilling', () => {

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

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('instantiates the processBillingController class', () => {

			const ProcessBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');
			let processBillingController = new ProcessBillingController();

			expect(objectutilities.getClassName(processBillingController)).to.equal('processBillingController');

		});

	});

	describe('process', () => {

		it('successfully processes a transaction', () => {

			let rebill = getValidRebill();
			let response_code = 'success';

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class Register {
				constructor() {}
				processTransaction() {
					return Promise.resolve(getValidRegisterResponse());
				}
			});

			const ProcessBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');
			let processBillingController = new ProcessBillingController();

			processBillingController.parameters.set('rebill', rebill);

			return processBillingController.process().then(result => {

				expect(result).to.equal(true);
				expect(processBillingController.parameters.store['registerresponse'].getCode()).to.equal(response_code);

			});

		});

	});

	describe('execute', () => {

		it('successfully executes', () => {

			let rebill = getValidRebill();
			let session = MockEntities.getValidSession(rebill.parentsession);
			let register_response = getValidRegisterResponse();
			let response_code = 'success';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class Register {
				constructor() {}
				processTransaction() {
					return Promise.resolve(register_response);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill)
				}
			});

			let message = getValidMessages()[0];
			const ProcessBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');
			let processBillingController = new ProcessBillingController();

			return processBillingController.execute(message).then(result => {
				expect(processBillingController.parameters.store['registerresponse'].getCode()).to.equal(response_code);
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(result.getCode()).to.equal('success');
			});
		});
	});

});
