
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidTransformedTransactionPrototype(){

	return MockEntities.getValidTransformedTransactionPrototype()

}

function getValidTransactionPrototype(){

	return MockEntities.getValidTransactionPrototype();

}

function getValidTransaction(){

	return MockEntities.getValidTransaction();

}

function getValidMerchantProvider(){

	return MockEntities.getValidMerchantProvider();

}

function getValidTransactionProducts(ids, expanded){

	return MockEntities.getValidTransactionProducts(ids, expanded);

}

function getValidRebill(){

	return MockEntities.getValidRebill();

}

function getValidProcessorResponse(){

	return MockEntities.getValidProcessorResponse();

}

describe('controllers/providers/register/Receipt.js', () => {

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

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {
		it('successfully constructs', () => {
			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			expect(objectutilities.getClassName(receiptController)).to.equal('RegisterRecieptGenerator');
		});
	});

	describe('createTransactionPrototype', () => {
		it('successfully creates transaction prototype for process', () => {

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			let valid_rebill = getValidRebill();
			let valid_processor_response = getValidProcessorResponse();
			let merchant_provider = getValidMerchantProvider();
			let transaction_products = getValidTransactionProducts(null, true);

			receiptController.parameters.set('rebill', valid_rebill);
			receiptController.parameters.set('amount', valid_rebill.amount);
			receiptController.parameters.set('transactiontype', 'sale');
			receiptController.parameters.set('processorresponse', valid_processor_response);
			receiptController.parameters.set('merchantprovider', merchant_provider.id);
			receiptController.parameters.set('transactionproducts', transaction_products);

			return receiptController.createTransactionPrototype().then((response) => {

				expect(response).to.equal(true);

				let transaction_prototype = receiptController.parameters.get('transactionprototype');

				expect(transaction_prototype).to.have.property('rebill');
				expect(transaction_prototype).to.have.property('amount');
				expect(transaction_prototype).to.have.property('processor_response');
				expect(transaction_prototype).to.have.property('type');
				expect(transaction_prototype).to.have.property('result');
				expect(transaction_prototype).to.have.property('merchant_provider');
				expect(transaction_prototype).to.have.property('products');

				expect(transaction_prototype.amount).to.equal(valid_rebill.amount);
				expect(transaction_prototype.rebill).to.deep.equal(valid_rebill);
				expect(transaction_prototype.processor_response).to.deep.equal(valid_processor_response);
				expect(transaction_prototype.merchant_provider).to.equal(merchant_provider.id);
				expect(transaction_prototype.products).to.deep.equal(transaction_products);

			});

		});

		it('successfully creates transaction prototype for refund', () => {

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			receiptController.parameters.set('rebill', getValidRebill());
			receiptController.parameters.set('transactiontype', 'refund');
			receiptController.parameters.set('processorresponse', getValidProcessorResponse());
			receiptController.parameters.set('associatedtransaction', getValidTransaction());
			receiptController.parameters.set('amount', getValidTransaction().amount);

			return receiptController.createTransactionPrototype().then((response) => {
				expect(response).to.equal(true);
				let transaction_prototype = receiptController.parameters.get('transactionprototype');

				expect(transaction_prototype).to.have.property('rebill');
				expect(transaction_prototype).to.have.property('amount');
				expect(transaction_prototype).to.have.property('processor_response');
				expect(transaction_prototype).to.have.property('type');
				expect(transaction_prototype).to.have.property('result');
				expect(transaction_prototype).to.have.property('merchant_provider');
				expect(transaction_prototype).to.have.property('products');
				expect(transaction_prototype).to.have.property('associated_transaction');
			});

		});

		it('successfully creates transaction prototype for reverse', () => {

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			receiptController.parameters.set('rebill', getValidRebill());
			receiptController.parameters.set('transactiontype', 'reverse');
			receiptController.parameters.set('processorresponse', getValidProcessorResponse());
			receiptController.parameters.set('associatedtransaction', getValidTransaction());
			receiptController.parameters.set('amount', getValidTransaction().amount);

			return receiptController.createTransactionPrototype().then((response) => {
				expect(response).to.equal(true);
				let transaction_prototype = receiptController.parameters.get('transactionprototype');

				expect(transaction_prototype).to.have.property('rebill');
				expect(transaction_prototype).to.have.property('amount');
				expect(transaction_prototype).to.have.property('processor_response');
				expect(transaction_prototype).to.have.property('type');
				expect(transaction_prototype).to.have.property('result');
				expect(transaction_prototype).to.have.property('merchant_provider');
				expect(transaction_prototype).to.have.property('products');
				expect(transaction_prototype).to.have.property('associated_transaction');
			});

		});
	});

	describe('transformTransactionPrototypeObject', () => {
		it('successfully transforms transaction prototype', () => {

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			let valid_transaction_prototype = getValidTransactionPrototype();

			receiptController.parameters.set('transactionprototype', valid_transaction_prototype);
			receiptController.transformTransactionPrototypeObject();
			let transformed_transaction_prototype = receiptController.parameters.get('transformed_transaction_prototype');

			expect(transformed_transaction_prototype).to.have.property('rebill');
			expect(transformed_transaction_prototype).to.have.property('processor_response');
			expect(transformed_transaction_prototype).to.have.property('amount');
			expect(transformed_transaction_prototype).to.have.property('products');
			expect(transformed_transaction_prototype).to.have.property('alias');
			expect(transformed_transaction_prototype).to.have.property('merchant_provider');
			expect(transformed_transaction_prototype).to.have.property('type');
			expect(transformed_transaction_prototype).to.have.property('result');

			expect(transformed_transaction_prototype.rebill).to.deep.equal(valid_transaction_prototype.rebill.id);
			expect(transformed_transaction_prototype.processor_response).to.deep.equal(JSON.stringify(valid_transaction_prototype.processor_response));
			expect(transformed_transaction_prototype.amount).to.deep.equal(valid_transaction_prototype.amount);
			expect(transformed_transaction_prototype.products).to.deep.equal(valid_transaction_prototype.products);
			expect(typeof transformed_transaction_prototype.alias).to.equal('string');
			expect(transformed_transaction_prototype.merchant_provider).to.equal(valid_transaction_prototype.merchant_provider);
			expect(transformed_transaction_prototype.type).to.equal(valid_transaction_prototype.type);
			expect(transformed_transaction_prototype.result).to.equal(valid_transaction_prototype.result);

		});
	});

	describe('createTransaction', () => {
		it('successfully creates a transaction record', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();
			let transformed_transaction_prototype = getValidTransformedTransactionPrototype();

			receiptController.parameters.set('transformed_transaction_prototype', transformed_transaction_prototype);
			return receiptController.createTransaction().then(() => {
				let receipt_transaction = receiptController.parameters.get('receipt_transaction');

				expect(receipt_transaction).to.have.property('id');
				expect(receipt_transaction).to.have.property('created_at');
				expect(receipt_transaction).to.have.property('updated_at');
				expect(receipt_transaction).to.have.property('account');
				expect(receipt_transaction.processor_response).to.equal(transformed_transaction_prototype.processor_response);
				expect(receipt_transaction.amount).to.equal(transformed_transaction_prototype.amount);
				expect(receipt_transaction.merchant_provider).to.equal(transformed_transaction_prototype.merchant_provider);
				expect(receipt_transaction.type).to.equal(transformed_transaction_prototype.type);
				expect(receipt_transaction.result).to.equal(transformed_transaction_prototype.result);
				expect(receipt_transaction.products).to.equal(transformed_transaction_prototype.products);
				expect(receipt_transaction.rebill).to.equal(transformed_transaction_prototype.rebill);
			});
		});
	});

	describe('issueReceipt', () => {
		it('successfully issues a receipt', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			let issue_receipt_arguments = {
				rebill: getValidRebill(),
				amount: getValidRebill().amount,
				transactiontype: 'sale',
				processorresponse: getValidProcessorResponse(),
				merchant_provider: getValidMerchantProvider().id,
				transaction_products: getValidTransactionProducts(null, true)
			};

			const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');
			let receiptController = new ReceiptController();

			return receiptController.issueReceipt(issue_receipt_arguments).then(() => {
				let receipt_transaction = receiptController.parameters.get('receipt_transaction');

				expect(receipt_transaction).to.have.property('id');
			})
		});
	});

});
