
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function assumePermissionedRole(){

	let permissions = [
		{
			action:'*',
			object: '*'
		}
	];

	PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}


function getInvalidArgumentsArray(omit){

	let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

	omit = (_.isUndefined(omit))?[]:omit;
	return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
		return !(_.includes(omit, invalid_argument));
	});

}

function getValidTransaction(){

	let transaction = MockEntities.getValidTransaction();

	transaction.products.forEach(transaction_product => {
		transaction_product.product = transaction_product.product.id;
	});

	return transaction;
}

function getTransactionMerchantProvider(){

	return MockEntities.getValidMerchantProvider();

}

function getValidParameters(){

	return {
		transaction: getValidTransaction()
	}

}

describe('helpers/transaction/Reverse.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
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

		it('successfully constructs a reverse class', () => {
			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			expect(vh.constructor.name).to.equal('Reverse');

		});

	});

	describe('setParameters', () => {

		it('fails to set parameters', () => {
			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();
			let invalid_arguments_array = getInvalidArgumentsArray();

			arrayutilities.map(invalid_arguments_array, invalid_argument => {
				try{
					vh.setParameters(invalid_argument);
				}catch(error){
					expect(error.message).to.be.defined;
				}
			});
		});

		it('successfully sets parameters', () => {
			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			let valid_parameters = getValidParameters();

			vh.setParameters(valid_parameters);

		});

	});

	describe('hydrateParameters', () => {

		it('successfully hydrates the parameters', () => {

			assumePermissionedRole();

			let merchant_provider = getTransactionMerchantProvider();
			let transaction = getValidTransaction();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				getMerchantProvider() {
					return Promise.resolve(merchant_provider);
				}
				get() {
					return Promise.resolve(transaction);
				}
			});

			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			let valid_parameters = getValidParameters();

			vh.parameters.set('transaction', valid_parameters.transaction);

			return vh.hydrateParameters().then(result => {
				expect(result).to.equal(true);

				let test_merchantprovider = merchant_provider;
				let hydrated_merchantprovider = vh.parameters.get('selected_merchantprovider');

				delete hydrated_merchantprovider.created_at;
				delete hydrated_merchantprovider.updated_at;
				delete test_merchantprovider.created_at;
				delete test_merchantprovider.updated_at;

				expect(test_merchantprovider).to.deep.equal(hydrated_merchantprovider);

			});

		});

	});

	describe('createProcessingParameters', () => {

		//fails when transaction isn't set
		//fails when transaction isn't the right thing...

		it('successfully creates processing parameters', () => {

			//assumePermissionedRole();
			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			vh.parameters.set('transaction', getValidTransaction());

			return vh.createProcessingParameters().then(processing_parameters => {

				expect(processing_parameters).to.have.property('transaction');

				expect(vh.parameters.get('reverse')).to.deep.equal(processing_parameters);

			});

		});

	});

	describe('reverse', () => {

		it('successfully reverses a transaction', () => {

			assumePermissionedRole()

			let merchant_provider = getTransactionMerchantProvider();
			let transaction = getValidTransaction();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				getMerchantProvider() {
					return Promise.resolve(merchant_provider);
				}
				get() {
					return Promise.resolve(transaction);
				}
			});

			let mock_gateway = class {
				constructor(){}
				reverse(){
					return Promise.resolve(
						{
							code: 200,
							result: 'success',
							message: 'Success'
						}
					);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('vendors', 'merchantproviders/NMI/handler.js'), mock_gateway);

			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			return vh.reverse({transaction:transaction}).then(result => {
				expect(result).to.have.property('code');
				expect(result).to.have.property('result');
				expect(result).to.have.property('message');
			});

		});

	});

	describe('reverseTransaction', () => {

		it('reverses a transaction', () => {

			let merchant_provider = getTransactionMerchantProvider();

			let transaction = getValidTransaction();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				getMerchantProvider() {
					return Promise.resolve(merchant_provider);
				}
				get({id}) {
					expect(id).to.equal(transaction.id);
					return Promise.resolve(transaction);
				}
			});

			mockery.registerMock('request', {
				post: (request_options, callback) => {
					callback(null, transaction.processor_response.result);
				}
			});

			let mock_gateway = class {
				constructor(){}

				reverse(){
					return Promise.resolve(
						{
							code: 200,
							result: 'success',
							message: 'Success'
						}
					);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('vendors', 'merchantproviders/NMI/handler.js'), mock_gateway);

			const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');
			let vh = new ReverseHelperController();

			vh.parameters.set('selected_merchantprovider', merchant_provider);
			vh.parameters.set('transaction', transaction);

			return vh.reverseTransaction().then((result) => {
				expect(result).to.have.property('code');
				expect(result).to.have.property('message');
				expect(result).to.have.property('result');
			})
		})
	})
});
