
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidFulfillmentProvider() {

	return MockEntities.getValidFulfillmentProvider();

}

function getValidFulfillmentProviderReference() {

	return uuidV4();

}

function getValidTransactionProducts(ids, extended) {

	return [
		MockEntities.getValidTransactionProduct(ids, extended),
		MockEntities.getValidTransactionProduct(ids, extended)
	];

}

function getValidTransaction() {
	return MockEntities.getValidTransaction()
}

function getValidAugmentedTransactionProducts(ids, extended) {

	let transaction_products = getValidTransactionProducts(ids, extended);

	return arrayutilities.map(transaction_products, transaction_product => {

		let transaction = getValidTransaction();

		transaction.products = [transaction_product];

		return objectutilities.merge(transaction_product, {
			transaction: transaction
		});
	});

}

describe('/providers/terminal/Receipt.js', () => {

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

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const TerminalReceiptGenerator = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
			let terminalReceipt = new TerminalReceiptGenerator();

			expect(objectutilities.getClassName(terminalReceipt)).to.equal('TerminalRecieptGenerator');

		});

	});

	describe('issueReceipt', () => {

		it('successfully issues a new shipping receipt', () => {

			let fulfillment_provider = getValidFulfillmentProvider();
			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);

			let transactions = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.transaction;
			});

			let fulfillment_provider_reference = getValidFulfillmentProviderReference();
			let shipping_receipt_id = uuidV4();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get({
					id
				}) {
					let transaction = arrayutilities.find(transactions, transaction => {
						return transaction.id == id;
					});

					return Promise.resolve(transaction);
				}
				update({
					entity
				}) {
					entity.updated_at = timestamp.getISO8601();
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				create({
					entity
				}) {
					entity.id = shipping_receipt_id;
					let now = timestamp.getISO8601();

					entity.created_at = now;
					entity.updated_at = now;
					return Promise.resolve(entity);
				}
			});

			const TerminalReceiptGenerator = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
			let terminalReceiptGenerator = new TerminalReceiptGenerator();

			return terminalReceiptGenerator.issueReceipt({
				fulfillment_provider_id: fulfillment_provider.id,
				augmented_transaction_products: augmented_transaction_products,
				fulfillment_provider_reference: fulfillment_provider_reference
			}).then(result => {
				expect(result.id).to.equal(shipping_receipt_id);
			});

		});

	});

});
