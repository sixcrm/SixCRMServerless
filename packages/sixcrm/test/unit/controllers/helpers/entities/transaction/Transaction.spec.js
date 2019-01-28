

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidTransaction(){

	return getValidTransactions()[0];

}

function getValidTransactions(){

	return [MockEntities.getValidTransaction(),MockEntities.getValidTransaction()];

}

function getValidTransactionProduct(){

	return MockEntities.getValidTransactionProduct()

}

describe('helpers/entities/transaction/Transaction.js', () => {

	before(() => {

		PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

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

	describe('getTransactionProducts', () => {

		it('returns transaction products from transaction records', () => {

			let transaction = getValidTransaction();
			let transaction_products = transaction.products;

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			let result = transactionHelperController.getTransactionProducts([transaction]);

			expect(result).to.deep.equal(transaction_products);

		});

		it('returns an empty array when there aren\'t any transaction products in transaction', () => {

			let transaction = getValidTransaction();
			delete transaction.products;

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			let result = transactionHelperController.getTransactionProducts([transaction]);

			expect(result).to.deep.equal([]);

		});

	});

	describe('markTransactionChargeback', () => {

		it('updates a transaction record as "chargeback" (true)', () => {

			let transaction = getValidTransaction();
			let expected_transaction = objectutilities.clone(transaction);

			expected_transaction.chargeback = true;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				get() {
					return Promise.resolve(transaction);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			return transactionHelperController.markTransactionChargeback({transactionid: transaction.id, chargeback_status: true}).then(() => {

				return expect(transactionHelperController.parameters.store['transaction'].chargeback).to.equal(true);

			})

		});

		it('updates a transaction record as "non-chargeback" (false)', () => {

			let transaction = getValidTransaction();

			transaction.chargeback = true;

			let expected_transaction = objectutilities.clone(transaction);

			delete expected_transaction.chargeback;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get() {
					return Promise.resolve(transaction);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			return transactionHelperController.markTransactionChargeback({transactionid: transaction.id, chargeback_status: false}).then(() => {

				return expect(transactionHelperController.parameters.store['transaction'].chargeback).to.equal(false);

			});

		});

	});

	describe('updateTransactionProductsPrototype', () => {

		it('successfully updates the local transaction model with a new transaction prototype', () => {

			let transaction = getValidTransaction();

			let shipping_receipt = uuidV4();
			let updated_transaction_products = arrayutilities.map(transaction.products, tp => {
				return {
					product: tp.product.id,
					amount: tp.amount,
					shipping_receipt: shipping_receipt
				};
			});

			let result_transaction = objectutilities.clone(transaction);

			arrayutilities.map(result_transaction.products, (rtp, index) => {
				result_transaction.products[index].shipping_receipt = shipping_receipt;
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('transaction', transaction);
			transactionHelperController.parameters.set('updatedtransactionproducts', updated_transaction_products);

			let result = transactionHelperController.updateTransactionProductsPrototype();

			expect(result).to.equal(true);

			expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(result_transaction);

		});

		it('throws error when transaction product is not matching updated transaction product data', () => {

			let transaction = getValidTransaction();

			let updated_transaction_product = getValidTransactionProduct();

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('transaction', transaction);
			transactionHelperController.parameters.set('updatedtransactionproducts', [updated_transaction_product]);

			try {
				transactionHelperController.updateTransactionProductsPrototype()
			}catch (error) {
				expect(error.message).to.equal('[500] Unaccounted for transaction products in update.');
			}
		});

	});

	describe('updateTransaction', () => {

		it('successfully updates a transaction', () => {

			let transaction = getValidTransaction();
			let updated_transaction = objectutilities.clone(transaction);

			updated_transaction.products[0].shipping_receipt = uuidV4();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('transaction', updated_transaction);

			return transactionHelperController.updateTransaction().then(result => {
				expect(result).to.equal(true);
				return expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(updated_transaction);
			});

		});

	});

	describe('acquireTransaction', () => {

		it('successfully acquires transaction', () => {

			let transaction = getValidTransaction();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get({id}) {
					expect(id).to.equal(transaction.id);
					return Promise.resolve(transaction);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('transaction', transaction);
			transactionHelperController.parameters.set('transactionid', transaction.id);

			return transactionHelperController.acquireTransaction().then(result => {
				expect(result).to.equal(true);
				return expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(transaction);
			});

		});

		it('throws error when transaction is not found', () => {

			let transaction = getValidTransaction();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get({id}) {
					expect(id).to.equal(transaction.id);
					return Promise.resolve(null);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('transactionid', transaction.id);

			return transactionHelperController.acquireTransaction().catch((error) => {
				expect(error.message).to.equal('[500] Transaction not found.');
			});

		});

	});

	describe('updateTransactionProducts', () => {

		it('successfully updates transaction products', () => {

			let transaction = getValidTransaction();

			let updated_transaction_product = {
				product: transaction.products[0].product.id,
				amount: transaction.products[0].amount,
				shipping_receipt: uuidV4()
			};

			let updated_transaction = objectutilities.clone(transaction);

			updated_transaction.products[0].shipping_receipt = updated_transaction_product.shipping_receipt;

			let params = {
				transaction_id: updated_transaction.id,
				updated_transaction_products: [updated_transaction_product]
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get({id}) {
					expect(id).to.equal(transaction.id);
					return Promise.resolve(transaction);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			transactionHelperController.parameters.set('updatedtransactionproducts', [updated_transaction_product]);
			transactionHelperController.parameters.set('transaction', updated_transaction);
			transactionHelperController.parameters.set('transactionid', updated_transaction.id);

			return transactionHelperController.updateTransactionProducts(params).then((result) => {
				expect(result).to.deep.equal(updated_transaction);
				return expect(transactionHelperController.parameters.store['transaction']).to.deep.equal(updated_transaction);
			});

		});

	});

});
