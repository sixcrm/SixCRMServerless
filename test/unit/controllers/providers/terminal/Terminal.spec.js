
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidVendorResponseClass(action) {

	let valid_vendor_response = getValidVendorResponse();

	let VendorResponseClass = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/Response.js');

	return new VendorResponseClass({
		vendor_response: {
			error: null,
			response: valid_vendor_response,
			body: valid_vendor_response.body
		},
		action: action,
		additional_parameters: {
			reference_number: uuidV4()
		}
	})

}

function getValidVendorResponse() {

	return {
		statusCode: 200,
		statusMessage: 'OK',
		body: getValidVendorResponseBody()
	}
}

function getValidVendorResponseBody() {

	return '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><FindOrders xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">&lt;orders&gt;&lt;order&gt;&lt;CustomerName&gt;Tests Hashtag Tests&lt;/CustomerName&gt;&lt;CustomerEmail&gt;Charlie.C@Hashtagfulfillment.com&lt;/CustomerEmail&gt;&lt;CustomerPhone&gt;&lt;/CustomerPhone&gt;&lt;Facility&gt;Hashtag Fulfillment&lt;/Facility&gt;&lt;FacilityID&gt;2&lt;/FacilityID&gt;&lt;WarehouseTransactionID&gt;1181282&lt;/WarehouseTransactionID&gt;&lt;ReferenceNum&gt;Order 682&lt;/ReferenceNum&gt;&lt;PONum&gt;&lt;/PONum&gt;&lt;Retailer /&gt;&lt;ShipToCompanyName&gt;Example Company&lt;/ShipToCompanyName&gt;&lt;ShipToName&gt;Example Company&lt;/ShipToName&gt;&lt;ShipToEmail&gt;&lt;/ShipToEmail&gt;&lt;ShipToPhone&gt;&lt;/ShipToPhone&gt;&lt;ShipToAddress1&gt;Example Address&lt;/ShipToAddress1&gt;&lt;ShipToAddress2&gt;&lt;/ShipToAddress2&gt;&lt;ShipToCity&gt;Example City&lt;/ShipToCity&gt;&lt;ShipToState&gt;CA&lt;/ShipToState&gt;&lt;ShipToZip&gt;90505&lt;/ShipToZip&gt;&lt;ShipToCountry&gt;US&lt;/ShipToCountry&gt;&lt;ShipMethod&gt;Next Day Air&lt;/ShipMethod&gt;&lt;MarkForName&gt;&lt;/MarkForName&gt;&lt;BatchOrderID /&gt;&lt;CreationDate&gt;2016-01-19T14:56:00&lt;/CreationDate&gt;&lt;EarliestShipDate /&gt;&lt;ShipCancelDate /&gt;&lt;PickupDate /&gt;&lt;Carrier&gt;Fed Ex&lt;/Carrier&gt;&lt;BillingCode&gt;BillThirdParty&lt;/BillingCode&gt;&lt;TotWeight&gt;0.33&lt;/TotWeight&gt;&lt;TotCuFt&gt;0.00&lt;/TotCuFt&gt;&lt;TotPackages&gt;1.0000&lt;/TotPackages&gt;&lt;TotOrdQty&gt;1.0000&lt;/TotOrdQty&gt;&lt;TotLines&gt;1.00&lt;/TotLines&gt;&lt;Notes&gt;&lt;/Notes&gt;&lt;OverAllocated&gt;&lt;/OverAllocated&gt;&lt;PickTicketPrintDate /&gt;&lt;ProcessDate&gt;2016-01-19&lt;/ProcessDate&gt;&lt;TrackingNumber&gt;&lt;/TrackingNumber&gt;&lt;LoadNumber&gt;&lt;/LoadNumber&gt;&lt;BillOfLading&gt;&lt;/BillOfLading&gt;&lt;MasterBillOfLading&gt;&lt;/MasterBillOfLading&gt;&lt;ASNSentDate /&gt;&lt;ConfirmASNSentDate&gt;&lt;/ConfirmASNSentDate&gt;&lt;RememberRowInfo&gt;1181282:10:2::2016/01/19:0:False:1:735163&lt;/RememberRowInfo&gt;&lt;/order&gt;&lt;/orders&gt;</FindOrders><totalOrders xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">2786</totalOrders></soap:Body></soap:Envelope>';

}

/*function getValidTestVendorParsedResponse(){

  return {
    orders:{
      order:[
        { CustomerName: [ 'Tests Hashtag Tests' ],
          CustomerEmail: [ 'Charlie.C@Hashtagfulfillment.com' ],
          CustomerPhone: [ '' ],
          Facility: [ 'Hashtag Fulfillment' ],
          FacilityID: [ '2' ],
          WarehouseTransactionID: [ '1181282' ],
          ReferenceNum: [ 'Order 682' ],
          PONum: [ '' ],
          Retailer: [ '' ],
          ShipToCompanyName: [ 'Example Company' ],
          ShipToName: [ 'Example Company' ],
          ShipToEmail: [ '' ],
          ShipToPhone: [ '' ],
          ShipToAddress1: [ 'Example Address' ],
          ShipToAddress2: [ '' ],
          ShipToCity: [ 'Example City' ],
          ShipToState: [ 'CA' ],
          ShipToZip: [ '90505' ],
          ShipToCountry: [ 'US' ],
          ShipMethod: [ 'Next Day Air' ],
          MarkForName: [ '' ],
          BatchOrderID: [ '' ],
          CreationDate: [ '2016-01-19T14:56:00' ],
          EarliestShipDate: [ '' ],
          ShipCancelDate: [ '' ],
          PickupDate: [ '' ],
          Carrier: [ 'Fed Ex' ],
          BillingCode: [ 'BillThirdParty' ],
          TotWeight: [ '0.33' ],
          TotCuFt: [ '0.00' ],
          TotPackages: [ '1.0000' ],
          TotOrdQty: [ '1.0000' ],
          TotLines: [ '1.00' ],
          Notes: [ '' ],
          OverAllocated: [ '' ],
          PickTicketPrintDate: [ '' ],
          ProcessDate: [ '2016-01-19' ],
          TrackingNumber: [ '' ],
          LoadNumber: [ '' ],
          BillOfLading: [ '' ],
          MasterBillOfLading: [ '' ],
          ASNSentDate: [ '' ],
          ConfirmASNSentDate: [ '' ],
          RememberRowInfo: [ '1181282:10:2::2016/01/19:0:False:1:735163' ]
        }
      ]
    }
  };

}*/

function getValidShippingReceipt() {

	return MockEntities.getValidShippingReceipt()

}

function getValidSession() {

	return MockEntities.getValidSession()

}

function getValidCustomer(id) {

	return MockEntities.getValidCustomer(id);
}

function getValidGroupedShipableTransactionProducts(ids, extended) {

	let return_object = {};

	return_object[uuidV4()] = getValidAugmentedTransactionProducts(ids, extended);
	return_object[uuidV4()] = getValidAugmentedTransactionProducts(ids, extended);

	return return_object;

}

function getValidCompoundFulfillmentResponse() {

	return {
		shipping_receipt: getValidShippingReceipt(),
		vendor_response_class: getValidVendorResponseClass('fulfill')
	};

}

function getValidFulfillmentProvider() {

	return MockEntities.getValidFulfillmentProvider();

}

function getValidShippableTransactionProductGroup(ids, extended) {

	return getValidAugmentedTransactionProducts(ids, extended);

}

function getValidAugmentedTransactionProducts(ids, extended) {

	let transaction_products = getValidTransactionProducts(ids, extended);

	return arrayutilities.map(transaction_products, transaction_product => {
		return objectutilities.merge(transaction_product, {
			transaction: getValidTransaction()
		});
	});

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

function getValidTransactionProducts(ids, expanded) {

	return MockEntities.getValidTransactionProducts(ids, expanded);

}

function getValidProducts(product_ids) {

	if (_.isUndefined(product_ids)) {
		product_ids = [uuidV4(), uuidV4()];
	}

	return arrayutilities.map(product_ids, product_id => {
		return MockEntities.getValidProduct(product_id);
	});

}

describe('controllers/providers/terminal/Terminal.js', function () {

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

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			expect(objectutilities.getClassName(terminalController)).to.equal('TerminalController');

		});

	});

	describe('acquireRebill', () => {

		it('successfully acquires a rebill', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			})

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('rebill', rebill);

			return terminalController.acquireRebill().then(result => {

				expect(result).to.equal(true);
				expect(terminalController.parameters.store['rebill']).to.deep.equal(rebill);

			});

		});

	});

	describe('acquireTransactions', () => {

		it('successfully acquires rebill transactions', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: transactions
					});
				}
				getResult(result, field) {
					du.debug('Get Result');
					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('rebill', rebill);

			return terminalController.acquireTransactions().then(result => {

				expect(result).to.equal(true);
				expect(terminalController.parameters.store['transactions']).to.deep.equal(transactions);

			});
		});
	});

	describe('setAugmentedTransactionProducts', () => {

		it('successfully sets augmented transaction products', () => {

			let transactions = getValidTransactions();
			let transaction_products = getValidTransactionProducts(null, true);

			let mock_transaction_helper_controller = class {
				constructor() {

				}
				getTransactionProducts() {
					return transaction_products;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('transactions', transactions);

			let result = terminalController.setAugmentedTransactionProducts();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['augmentedtransactionproducts']).to.be.defined;
			arrayutilities.map(terminalController.parameters.store['augmentedtransactionproducts'], augmented_transaction_product => {
				expect(_.includes(transactions, augmented_transaction_product.transaction)).to.equal(true);
			});

		});

	});

	describe('acquireProducts', () => {

		it('successfully acquires products', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let products = getValidProducts();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				getListByAccount() {
					return Promise.resolve({
						products: products
					});
				}
				getResult(result, field) {
					du.debug('Get Result');
					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			return terminalController.acquireProducts().then(result => {
				expect(result).to.equal(true);
				expect(terminalController.parameters.store['products']).to.deep.equal(products);
			});

		});

	});

	describe('getShipableProductIDs', () => {

		it('successfully sets shippable product ids (mixed case)', () => {

			let products = getValidProducts();

			products[0].ship = false;
			products[1].ship = true;

			let shipable_products = [products[1].id];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);

			let result = terminalController.getShipableProductIDs();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

		});

		it('successfully sets shippable product ids (all)', () => {

			let products = getValidProducts();

			products[0].ship = true;
			products[1].ship = true;

			let shipable_products = [products[0].id, products[1].id];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);

			let result = terminalController.getShipableProductIDs();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

		});

		it('successfully sets shippable product ids (none)', () => {

			let products = getValidProducts();

			products[0].ship = false;
			products[1].ship = false;

			let shipable_products = [];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);

			let result = terminalController.getShipableProductIDs();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipableproductids']).to.deep.equal(shipable_products);

		});

	});

	describe('createShipableTransactionProductGroup', () => {

		it('successfully creates a shipable transaction product group', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal(augmented_transaction_products);

		});

		it('successfully creates a shipable transaction product group (subset)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			shipable_product_ids.pop();
			shipable_product_ids.pop();
			shipable_product_ids.pop();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[0]]);

		});

		it('successfully creates a shipable transaction product group (subset-2)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			shipable_product_ids.shift();
			shipable_product_ids.shift();
			shipable_product_ids.shift();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[3]]);

		});

		it('successfully creates a shipable transaction product group (none)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = [];

			shipable_product_ids.pop();
			shipable_product_ids.pop();
			shipable_product_ids.pop();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

		});

		it('successfully creates a shipable transaction product group (subset - shipping_receipt, no re-ship)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].shipping_receipt = uuidV4();
			augmented_transaction_products[2].shipping_receipt = uuidV4();
			augmented_transaction_products[3].shipping_receipt = uuidV4();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup(false);

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[1]]);

		});

		it('successfully creates a shipable transaction product group (subset - shipping_receipt)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].shipping_receipt = uuidV4();
			augmented_transaction_products[2].shipping_receipt = uuidV4();
			augmented_transaction_products[3].shipping_receipt = uuidV4();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal(augmented_transaction_products);

		});

		it('successfully creates a shipable transaction product group (subset2 - shipping_receipt)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].shipping_receipt = uuidV4();
			augmented_transaction_products[1].shipping_receipt = uuidV4();
			augmented_transaction_products[2].shipping_receipt = uuidV4();
			augmented_transaction_products[3].shipping_receipt = uuidV4();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal(augmented_transaction_products);

		});

		it('successfully creates a shipable transaction product group (subset2 - shipping_receipt, no re-ship)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].shipping_receipt = uuidV4();
			augmented_transaction_products[1].shipping_receipt = uuidV4();
			augmented_transaction_products[2].shipping_receipt = uuidV4();
			augmented_transaction_products[3].shipping_receipt = uuidV4();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup(false);

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

		});

		it('successfully creates a shipable transaction product group (subset - no_ship)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].no_ship = true;
			augmented_transaction_products[2].no_ship = true;
			augmented_transaction_products[3].no_ship = true;

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([augmented_transaction_products[1]]);

		});

		it('successfully creates a shipable transaction product group (none - no_ship)', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let shipable_product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
				return augmented_transaction_product.product.id;
			});

			augmented_transaction_products[0].no_ship = true;
			augmented_transaction_products[1].no_ship = true;
			augmented_transaction_products[2].no_ship = true;
			augmented_transaction_products[3].no_ship = true;

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);
			terminalController.parameters.set('shipableproductids', shipable_product_ids);

			let result = terminalController.createShipableTransactionProductGroup();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['shipabletransactionproductgroup']).to.deep.equal([]);

		});

	});

	describe('groupShipableTransactionProductGroupByFulfillmentProvider', () => {

		it('successfully groups shipable products by fulfillment providers (empty)', () => {

			let shippable_transaction_product_group = getValidShippableTransactionProductGroup(null, true);
			let products = getValidProducts();

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);
			terminalController.parameters.set('shipabletransactionproductgroup', shippable_transaction_product_group);

			let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal({});

		});

		it('successfully groups shipable products by fulfillment providers (one group)', () => {

			let shipable_transaction_product_group = getValidShippableTransactionProductGroup([uuidV4(), uuidV4()], true);
			let products = getValidProducts();

			products[0].id = shipable_transaction_product_group[0].product.id;
			products[1].id = shipable_transaction_product_group[1].product.id;
			products[1].fulfillment_provider = products[0].fulfillment_provider;

			let grouped_products = {};

			grouped_products[products[1].fulfillment_provider] = shipable_transaction_product_group;

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);
			terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

			let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

		});

		it('successfully groups shipable products by fulfillment providers (one group)', () => {

			let shipable_transaction_product_group = getValidShippableTransactionProductGroup([uuidV4(), uuidV4()], true);
			let products = getValidProducts();

			products[0].id = shipable_transaction_product_group[0].product.id;
			products[1].id = shipable_transaction_product_group[1].product.id;
			products[1].fulfillment_provider = products[0].fulfillment_provider;

			let grouped_products = {}

			grouped_products[products[1].fulfillment_provider] = shipable_transaction_product_group;

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);
			terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

			let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

		});

		it('successfully groups shipable products by fulfillment providers (two groups)', () => {

			let shipable_transaction_product_group = getValidShippableTransactionProductGroup([uuidV4(), uuidV4()], true);
			let products = getValidProducts();

			products[0].id = shipable_transaction_product_group[0].product.id;
			products[1].id = shipable_transaction_product_group[1].product.id;

			let grouped_products = {}

			grouped_products[products[0].fulfillment_provider] = [shipable_transaction_product_group[0]];
			grouped_products[products[1].fulfillment_provider] = [shipable_transaction_product_group[1]];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('products', products);
			terminalController.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

			let result = terminalController.groupShipableTransactionProductGroupByFulfillmentProvider();

			expect(result).to.equal(true);
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.be.defined;
			expect(terminalController.parameters.store['groupedshipabletransactionproducts']).to.deep.equal(grouped_products);

		});

	});

	describe('transformFulfillResponses', () => {

		it('successfully evaluates compound fulfillment responses', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('success');

		});

		it('successfully evaluates fulfillment responses (fail)', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			compound_fulfillment_responses[0].vendor_response_class.setCode('fail');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('fail');

		});

		it('successfully evaluates fulfillment responses (error)', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			compound_fulfillment_responses[0].vendor_response_class.setCode('error');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('error');

		});

		it('successfully evaluates fulfillment responses (noaction)', () => {

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', []);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('noaction');

		});

	});

	describe('respond', () => {

		it('successfully responds', () => {

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('responsecode', 'success');

			let result = terminalController.respond();

			expect(result.getCode()).to.equal('success');

		});

	});

	describe('transformFulfillResponses', () => {

		it('successfully evaluates compound fulfillment responses', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('success');

		});

		it('successfully evaluates fulfillment responses (fail)', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			compound_fulfillment_responses[0].vendor_response_class.setCode('fail');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('fail');

		});

		it('successfully evaluates fulfillment responses (error)', () => {

			let compound_fulfillment_responses = [getValidCompoundFulfillmentResponse(), getValidCompoundFulfillmentResponse()];

			compound_fulfillment_responses[0].vendor_response_class.setCode('error');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('compoundfulfillmentresponses', compound_fulfillment_responses);

			let response = terminalController.transformFulfillResponses();

			expect(response).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.equal('error');

		});

	});

	describe('info', () => {

		it('Successfully executes a info operation on a shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();
			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.username = 'kristest';
			fulfillment_provider.provider.password = 'kristest',
			fulfillment_provider.provider.threepl_key = '{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
			fulfillment_provider.provider.threepl_customer_id = 10;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			let response_body = getValidVendorResponseBody();
			let vendor_response = {
				statusCode: 200,
				body: response_body
			}

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve({
							error: null,
							response: vendor_response,
							body: response_body
						});
					}
				}
			});

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			return terminalController.info({
				shipping_receipt: shipping_receipt
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('TerminalResponse');
				expect(result.getCode()).to.equal('success');
				let vendor_response = result.getVendorResponse();
				console.log(vendor_response);

			});

		});

	});

	describe('test', () => {

		it('Successfully executes a test of a fulfillment provider', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.username = 'kristest';
			fulfillment_provider.provider.password = 'kristest',
			fulfillment_provider.provider.threepl_key = '{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
			fulfillment_provider.provider.threepl_customer_id = 10;
			let vendor_response_class = getValidVendorResponseClass('test');

			/*let test_helper_mock = class {
			  constructor(){

			  }
			  execute(){
			    return Promise.resolve(vendor_response_class);
			  }
			};*/

			//mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/Test.js'), test_helper_mock);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			});

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			let response_body = getValidVendorResponseBody();
			let vendor_response = {
				statusCode: 200,
				body: response_body
			}

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve({
							error: null,
							response: vendor_response,
							body: response_body
						});
					}
				}
			});

			return terminalController.test({
				fulfillment_provider_id: fulfillment_provider.id
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('TerminalResponse');
				expect(result.getCode()).to.equal('success');
				expect(vendor_response_class.getParsedResponse()).to.deep.equal({
					success: true,
					message: 'Successfully validated.'
				});

			});

		});

	});

	xdescribe('fulfill (LIVE)', () => {

		const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
		PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

		it('successfully ships a rebill', () => {

			let rebill = {
			  "account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
			  "alias": "RMM8LFJ2XE",
			  "amount": 25.98,
			  "bill_at": "2018-06-13T17:19:44.000Z",
			  "created_at": "2018-06-13T17:19:45.300Z",
			  "history": [
			    {
			      "entered_at": "2018-06-13T17:19:47.415Z",
			      "state": "hold"
			    }
			  ],
			  "id": "f5948baf-549a-46af-b8bd-859b7a6f44f6",
			  "parentsession": "ac9d41fd-3a94-404a-85a1-6bc4e619fa84",
			  "processing": true,
			  "products": [
			    {
			      "amount": 12.99,
			      "product": {
			        "account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
			        "attributes": {
			          "dimensions": {
			            "height": {
			              "unitofmeasurement": "inches",
			              "units": 4.78
			            },
			            "length": {
			              "unitofmeasurement": "inches",
			              "units": 33
			            },
			            "width": {
			              "unitofmeasurement": "inches",
			              "units": 3.2
			            }
			          },
			          "images": [
			            {
			              "description": "This is a test image",
			              "dimensions": {
			                "height": 300,
			                "width": 400
			              },
			              "format": "jpeg",
			              "name": "testimage",
			              "path": "somepath"
			            }
			          ],
			          "weight": {
			            "unitofmeasurement": "pounds",
			            "units": 2.5
			          }
			        },
			        "created_at": "2018-04-12T19:28:16.765Z",
			        "default_price": 12.99,
			        "description": "This is a test description",
			        "dynamic_pricing": {
			          "max": 14.99,
			          "min": 9.99
			        },
			        "fulfillment_provider": "1bd805d0-0062-499b-ae28-00c5d1b827ba",
			        "id": "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
			        "name": "Test Product",
			        "ship": true,
			        "shipping_delay": 3600,
			        "sku": "123",
			        "updated_at": "2018-06-13T17:18:16.170Z"
			      },
			      "quantity": 2
			    }
			  ],
			  "state": "hold",
			  "state_changed_at": "2018-06-13T17:19:47.415Z",
			  "updated_at": "2018-06-13T17:19:47.429Z"
			};

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			return terminalController.fulfill({
				rebill: rebill
			}).then(result => {
				expect(result.getCode()).to.equal('success');
				expect(objectutilities.getClassName(result)).to.equal('TerminalResponse');
			});

		});

	});

	describe('fulfill', () => {

		it('successfully ships a rebill', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let product_ids = [];
			let session = getValidSession();
			let customer = getValidCustomer(session.customer);

			arrayutilities.map(transactions, transaction => {
				arrayutilities.map(transaction.products, transaction_product => {
					delete transaction_product.shipping_receipt;

					return product_ids.push(transaction_product.product.id);
				})
			});

			let products = getValidProducts(product_ids);

			arrayutilities.map(products, (product, index) => {
				products[index].ship = true;
				products[index].sku = 'SKU 10'
			});

			let shipping_receipt = getValidShippingReceipt();

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.username = 'kristest';
			fulfillment_provider.provider.password = 'kristest',
			fulfillment_provider.provider.threepl_key = '{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}',
			fulfillment_provider.provider.threepl_customer_id = 10;

			let mocked_receipt_class = class {
				constructor() {

				}
				issueReceipt() {
					return Promise.resolve(shipping_receipt);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mocked_receipt_class);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: transactions
					});
				}
				getResult(result, field) {
					du.debug('Get Result');
					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
				getSession() {
					return Promise.resolve(session)
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				getListByAccount() {
					return Promise.resolve({
						products: products
					});
				}
				getResult(result, field) {
					du.debug('Get Result');
					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			let mock_customer = class {
				constructor() {}

				get() {
					return Promise.resolve(customer)
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let mocked_fulfillment_class = class {
				constructor() {

				}
				execute() {
					return Promise.resolve(getValidVendorResponseClass('fulfill'));
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/Fulfill.js'), mocked_fulfillment_class);

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			return terminalController.fulfill({
				rebill: rebill
			}).then(result => {
				expect(result.getCode()).to.equal('success');
				expect(objectutilities.getClassName(result)).to.equal('TerminalResponse');
			});

		});

	});



	describe('executeFulfill', () => {

		it('successfully executes', () => {

			let grouped_shipable_transaction_products = getValidGroupedShipableTransactionProducts(null, true);

			let mocked_fulfillment_class = class {
				constructor() {

				}
				execute() {
					return Promise.resolve(getValidVendorResponseClass('fulfill'));
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/Fulfill.js'), mocked_fulfillment_class);

			let mocked_terminal_receipt_class = class {
				constructor() {

				}
				issueReceipt() {
					return Promise.resolve(getValidShippingReceipt());
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mocked_terminal_receipt_class);

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('groupedshipabletransactionproducts', grouped_shipable_transaction_products);

			return terminalController.executeFulfill().then(result => {

				expect(result).to.equal(true);

				arrayutilities.map(terminalController.parameters.get('compoundfulfillmentresponses'), compound_fulfillment_response => {
					expect(compound_fulfillment_response.vendor_response_class.getCode()).to.equal('success');
				});

			});

		});

	});

	describe('transformTestResponse', () => {

		it('transforms test response when vendor response code is a success', () => {

			let vendor_response_class = getValidVendorResponseClass('info');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			terminalController.parameters.set('vendorresponseclass', vendor_response_class);

			expect(terminalController.transformTestResponse()).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.deep.equal('success');
		});

		it('transforms test response when vendor response code is an error', () => {

			let vendor_response_class = getValidVendorResponseClass('test');

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
			let terminalController = new TerminalController();

			vendor_response_class.setCode('error');
			terminalController.parameters.set('vendorresponseclass', vendor_response_class);

			expect(terminalController.transformTestResponse()).to.equal(true);
			expect(terminalController.parameters.store['responsecode']).to.deep.equal('error');
		});
	});

});
