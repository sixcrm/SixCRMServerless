
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id) {

	return MockEntities.getValidMessage(id);

}

function getValidShippingReceipt() {

	return MockEntities.getValidShippingReceipt();

}

function getValidShippingReceipts() {

	return [
		getValidShippingReceipt(),
		getValidShippingReceipt(),
		getValidShippingReceipt()
	];

}

function getValidTransactionProducts(ids, expanded) {

	return MockEntities.getValidTransactionProducts(ids, expanded);

}

function getValidRebill(id) {

	return MockEntities.getValidRebill(id);

}

function getValidTransaction(id) {

	return MockEntities.getValidTransaction(id);

}

function getValidTransactions() {

	return [
		getValidTransaction(),
		getValidTransaction()
	];

}

xdescribe('controllers/workers/confirmDelivered', () => {

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

		it('instantiates the confirmDeliveredController class', () => {

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			expect(objectutilities.getClassName(confirmedDeliveredController)).to.equal('confirmDeliveredController');

		});

	});

	describe('acquireTransactions', () => {

		it('successfully acquires transactions', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve(transactions);
				}
				getResult() {
					return Promise.resolve(transactions);
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('rebill', rebill);

			return confirmedDeliveredController.acquireTransactions().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['transactions']).to.deep.equal(transactions);

			});

		});

	});

	describe('acquireTransactionProducts', () => {

		it('successfully acquires transaction products', () => {

			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts(null, true);

			transaction_products.forEach(transaction_product => {
				transaction_product.shipping_receipt = uuidV4();
			});

			let mock_transaction_helper_controller = class {
				constructor() {

				}
				getTransactionProducts() {
					return transaction_products;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('transactions', transactions);

			return confirmedDeliveredController.acquireTransactionProducts().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['shippedtransactionproducts']).to.deep.equal(transaction_products);

			});

		});

	});

	describe('acquireShippingReceipts', () => {

		it('successfully acquires shipping receipts', () => {

			let transaction_products = getValidTransactionProducts(null, true);

			transaction_products.forEach(transaction_product => {
				transaction_product.shipping_receipt = uuidV4()
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(getValidShippingReceipt());
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('shippedtransactionproducts', transaction_products);

			return confirmedDeliveredController.acquireShippingReceipts().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['shippingreceipts']).to.be.defined;

			});

		});

	});

	describe('acquireProductDeliveredStati', () => {

		it('successfully acquires shipping stati', () => {

			let shipping_receipts = getValidShippingReceipts();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
				constructor() {}
				isDelivered() {
					return Promise.resolve(true);
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('shippingreceipts', shipping_receipts);

			return confirmedDeliveredController.acquireProductDeliveredStati().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['productdeliveredstati']).to.be.defined;

			});

		});

	});

	describe('setDeliveredStatus', () => {

		it('successfully sets delivered status', () => {

			let product_delivered_stati = [true, true, true];

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('productdeliveredstati', product_delivered_stati);

			return confirmedDeliveredController.setDeliveredStatus().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.be.defined;
				expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.equal(true);

			});

		});

		it('successfully sets delivered status to false', () => {

			let product_delivered_stati = [true, true, false];

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('productdeliveredstati', product_delivered_stati);

			return confirmedDeliveredController.setDeliveredStatus().then(result => {

				expect(result).to.equal(true);
				expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.be.defined;
				expect(confirmedDeliveredController.parameters.store['rebilldeliveredstatus']).to.equal(false);

			});

		});

	});

	describe('respond', () => {

		it('successfully responds', () => {

			let rebill_delivered_status = true;

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('rebilldeliveredstatus', rebill_delivered_status);

			return confirmedDeliveredController.respond()
				.then((response) => {

					expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
					expect(response.getCode()).to.equal('success');

				});

		});

		it('successfully responds', () => {

			let rebill_delivered_status = false;

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			confirmedDeliveredController.parameters.set('rebilldeliveredstatus', rebill_delivered_status);

			return confirmedDeliveredController.respond()
				.then((response) => {

					expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
					expect(response.getCode()).to.equal('noaction');

				});

		});

	});

	describe('execute', () => {

		it('successfully executes (success)', () => {

			let message = getValidMessage();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts(null, true);
			let shipping_receipt = getValidShippingReceipt();

			transaction_products.forEach(transaction_product => {
				transaction_product.shipping_receipt = uuidV4()
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
				constructor() {}
				isDelivered() {
					return Promise.resolve(true);
				}
			});

			let mock_transaction_helper_controller = class {
				constructor() {

				}
				getTransactionProducts() {
					return transaction_products;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve(transactions);
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			return confirmedDeliveredController.execute(message).then((response) => {

				expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
				expect(response.getCode()).to.equal('success');

			});

		});

		it('successfully executes (noaction)', () => {

			let message = getValidMessage();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts(null, true);
			let shipping_receipt = getValidShippingReceipt();

			transaction_products.forEach(transaction_product => {
				transaction_product.shipping_receipt = uuidV4()
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), class {
				constructor() {}
				isDelivered() {
					return Promise.resolve(false);
				}
			});

			let mock_transaction_helper_controller = class {
				constructor() {

				}
				getTransactionProducts() {
					return transaction_products;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve(transactions);
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor() {}
				pushEvent() {
					return Promise.resolve({});
				}
			});

			const ConfirmedDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');
			let confirmedDeliveredController = new ConfirmedDeliveredController();

			return confirmedDeliveredController.execute(message).then((response) => {

				expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
				expect(response.getCode()).to.equal('noaction');

			});

		});

	});

});
