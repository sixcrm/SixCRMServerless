
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

function getValidShippingProviderResponse(){

	return new ShippingProviderResponse({
		shortname: 'usps',
		parameters: {
			delivered: true,
			status: 'in-transit',
			detail: 'May 30 11:07 am NOTICE LEFT WILMINGTON DE 19801.'
		},
		result: 'success'
	});

}

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

function getValidShippingReceipt(){

	return MockEntities.getValidShippingReceipt();

}

function getValidShippingReceipts(){

	return [
		getValidShippingReceipt(),
		getValidShippingReceipt(),
		getValidShippingReceipt()
	];

}

function getValidTransactionProducts(ids, expanded){

	return MockEntities.getValidTransactionProducts(ids, expanded);

}

function getValidRebill(){

	return MockEntities.getValidRebill();

}

function getValidTransactions(){

	return [
		MockEntities.getValidTransaction(),
		MockEntities.getValidTransaction()
	];

}

xdescribe('controllers/workers/confirmShipped', () => {

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

		it('instantiates the confirmShippedController class', () => {

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			expect(objectutilities.getClassName(confirmedShippedController)).to.equal('confirmShippedController');

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

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('rebill', rebill);

			return confirmedShippedController.acquireTransactions().then(result => {

				expect(result).to.equal(true);
				expect(confirmedShippedController.parameters.store['transactions']).to.deep.equal(transactions);

			});

		});

	});

	describe('acquireTransactionProducts', () => {

		it('successfully acquires transaction products', () => {

			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts(null, true);

			transaction_products.forEach(transaction_product => {
				transaction_product.shipping_receipt = uuidV4()
			});

			let mock_transaction_helper_controller = class {
				constructor(){

				}
				getTransactionProducts(){
					return transaction_products;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('transactions', transactions);

			return confirmedShippedController.acquireTransactionProducts().then(result => {

				expect(result).to.equal(true);
				expect(confirmedShippedController.parameters.store['shippedtransactionproducts']).to.deep.equal(transaction_products);

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

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('shippedtransactionproducts', transaction_products);

			return confirmedShippedController.acquireShippingReceipts().then(result => {

				expect(result).to.equal(true);
				expect(confirmedShippedController.parameters.store['shippingreceipts']).to.be.defined;

			});

		});

	});

	describe('acquireProductShippedStati', () => {

		xit('successfully acquires shipping stati', () => {

			let shipping_receipts = getValidShippingReceipts();
			let shipping_status_object = getValidShippingProviderResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), {
				getStatus:() => {
					return Promise.resolve(shipping_status_object);
				}
			});

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('shippingreceipts', shipping_receipts);

			return confirmedShippedController.acquireProductShippedStati().then(result => {

				expect(result).to.equal(true);
				expect(confirmedShippedController.parameters.store['productshippedstati']).to.be.defined;

			});

		});

	});

	describe('respond', () => {

		it('successfully responds', () => {

			let rebill_shipped_status = true;

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('rebillshippedstatus', rebill_shipped_status);

			return confirmedShippedController.respond()
				.then((response) => {

					expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
					expect(response.getCode()).to.equal('success');

				});

		});

		it('successfully responds', () => {

			let rebill_shipped_status = false;

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			confirmedShippedController.parameters.set('rebillshippedstatus', rebill_shipped_status);

			return confirmedShippedController.respond()
				.then((response) => {

					expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
					expect(response.getCode()).to.equal('noaction');

				});

		});

	});

	describe('execute', () => {

		xit('successfully executes (success)', () => {

			let message = getValidMessage('00c103b4-670a-439e-98d4-5a2834bb5f00');
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts();
			let shipping_status_object = getValidShippingProviderResponse();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), {
				getStatus:() => {
					return Promise.resolve(shipping_status_object);
				}
			});

			let mock_transaction_helper_controller = class {
				constructor(){

				}
				getTransactionProducts(){
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
					return Promise.resolve(getValidShippingReceipt());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			return confirmedShippedController.execute(message).then((response) => {

				expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
				expect(response.getCode()).to.equal('success');

			});

		});

		xit('successfully executes (noaction)', () => {

			let message = getValidMessage('00c103b4-670a-439e-98d4-5a2834bb5f00');
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts();
			let shipping_status_object = getValidShippingProviderResponse();

			shipping_status_object.parameters.store['status'] = 'unknown';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'helpers/shippingcarriers/ShippingStatus.js'), {
				getStatus:() => {
					return Promise.resolve(shipping_status_object);
				}
			});

			let mock_transaction_helper_controller = class {
				constructor(){

				}
				getTransactionProducts(){
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
					return Promise.resolve(getValidShippingReceipt());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ConfirmedShippedController = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');
			let confirmedShippedController = new ConfirmedShippedController();

			return confirmedShippedController.execute(message).then((response) => {

				expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
				expect(response.getCode()).to.equal('noaction');

			});

		});

	});

});
