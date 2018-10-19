
const _ = require('lodash');
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

function getValidRegisterResponse(response_type) {

	response_type = (_.isUndefined(response_type) || _.isNull(response_type)) ? 'success' : response_type;

	const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');

	return new RegisterResponse({
		response_type: response_type,
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

	return {
		bill_at: "2017-04-06T18:40:41.405Z",
		id: "70de203e-f2fd-45d3-918b-460570338c9b",
		account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
		parentsession: "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
		product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
		amount: 79.99,
		created_at: "2017-04-06T18:40:41.405Z",
		updated_at: "2017-04-06T18:41:12.521Z"
	};

}

xdescribe('controllers/workers/recoverBilling', () => {

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

		it('instantiates the recoverBillingController class', () => {

			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			expect(objectutilities.getClassName(recoverBillingController)).to.equal('recoverBillingController');

		});

	});

	describe('markRebill', () => {

		it('successfully marks and updates a rebill.', () => {

			let rebill = getValidRebill();
			let registerresponse = getValidRegisterResponse('decline');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
			});

			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			recoverBillingController.parameters.set('rebill', rebill);
			recoverBillingController.parameters.set('registerresponse', registerresponse);

			return recoverBillingController.markRebill().then(result => {
				expect(result).to.equal(true);
				expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(true);
			})
		});

		it('skips updating a rebill. (success)', () => {

			let rebill = getValidRebill();
			let registerresponse = getValidRegisterResponse();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
			});

			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			recoverBillingController.parameters.set('rebill', rebill);
			recoverBillingController.parameters.set('registerresponse', registerresponse);

			return recoverBillingController.markRebill().then(() => {

				return expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(undefined);

			});

		});

		it('skips updating a rebill. (error)', () => {

			let rebill = getValidRebill();
			let registerresponse = getValidRegisterResponse('error');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
			});

			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			recoverBillingController.parameters.set('rebill', rebill);
			recoverBillingController.parameters.set('registerresponse', registerresponse);

			return recoverBillingController.markRebill().then(() => {

				return expect(recoverBillingController.parameters.store['rebill'].second_attempt).to.equal(undefined);

			})
		});


	});

	describe('process', () => {

		it('successfully processes a transaction', () => {

			let rebill = getValidRebill();
			let response_code = 'success';

			let register_mock = class Register {
				constructor() {

				}
				processTransaction() {
					return Promise.resolve(getValidRegisterResponse());
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), register_mock);

			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			recoverBillingController.parameters.set('rebill', rebill);

			return recoverBillingController.process().then(result => {

				expect(result).to.equal(true);
				expect(recoverBillingController.parameters.store['registerresponse'].getCode()).to.equal(response_code);

			});

		});

	});

	describe('execute', () => {

		it('successfully executes', () => {

			let rebill = getValidRebill();
			let session = MockEntities.getValidSession(rebill.parentsession);
			let register_response = getValidRegisterResponse();

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
			const RecoverBillingController = global.SixCRM.routes.include('controllers', 'workers/recoverBilling.js');
			let recoverBillingController = new RecoverBillingController();

			return recoverBillingController.execute(message).then(result => {
				expect(recoverBillingController.parameters.store['registerresponse'].getCode()).to.equal('success');
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});
