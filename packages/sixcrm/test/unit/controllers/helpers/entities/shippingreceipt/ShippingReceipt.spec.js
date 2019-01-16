
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
let ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');

function getValidShippingReceipts(ids){

	ids = (!_.isUndefined(ids))?ids:[uuidV4(), uuidV4()];

	return arrayutilities.map(ids, id => getValidShippingReceipt(id));

}

function getValidShippingReceipt(id){

	return MockEntities.getValidShippingReceipt(id);

}

describe('controllers/helpers/entities/shippingreceipt/ShippingReceipt.js', () => {

	beforeEach(() => {
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

		it('successfully constructs',  () => {

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			expect(objectutilities.getClassName(shippingReceiptHelperController)).to.equal('ShippingReceiptHelperController');

		});

	});

	describe('getTrackingNumber', () => {

		it('successfully return the tracking number', () => {

			let shipping_receipt = getValidShippingReceipt();
			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			let result = shippingReceiptHelperController.getTrackingNumber(shipping_receipt);

			expect(result).to.equal(shipping_receipt.tracking.id);

		});

		it('successfully returns null when the tracking number is not provided', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.tracking;

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			let result = shippingReceiptHelperController.getTrackingNumber(shipping_receipt);

			expect(result).to.equal(null);

		});

		it('successfully throws an error when the tracking number is not provided', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.tracking;

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			try{
				shippingReceiptHelperController.getTrackingNumber(shipping_receipt, true);
			}catch(error){
				expect(error.message).to.equal('[500] Shipping Receipt missing property "trackingnumber"');
			}

		});

	});

	describe('acquireShippingReceipt', () => {

		it('successfully acquires a shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();

			mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);

			return shippingReceiptHelperController.acquireShippingReceipt().then(result => {
				expect(result).to.equal(true);
				return expect(shippingReceiptHelperController.parameters.store['shippingreceipt']).to.deep.equal(shipping_receipt);
			});
		});

		it('successfully acquires a shipping receipt when shipping receipt controller is set', () => {

			let shipping_receipt = getValidShippingReceipt();

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			shippingReceiptHelperController.shippingReceiptController.get = () => {
				return Promise.resolve(shipping_receipt);
			};

			shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);

			return shippingReceiptHelperController.acquireShippingReceipt().then(result => {
				expect(result).to.equal(true);
				return expect(shippingReceiptHelperController.parameters.store['shippingreceipt']).to.deep.equal(shipping_receipt);
			});
		});

	});

	describe('pushUpdatedShippingReceipt', () => {

		it('successfully pushes the updated shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();

			mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
				update() {
					return Promise.resolve(shipping_receipt);
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('updatedshippingreceipt', shipping_receipt);

			return shippingReceiptHelperController.pushUpdatedShippingReceipt().then(result => {
				expect(result).to.equal(true);
				return expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.deep.equal(shipping_receipt);
			});
		});

	});

	describe('buildUpdatedShippingReceiptPrototype', () => {

		it('successfully builds the updated shipping receipt prototype without previous history', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.history;

			let shipping_status = 'delivered';
			let shipping_detail = 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.';

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);
			shippingReceiptHelperController.parameters.set('shippingdetail', shipping_detail);

			let result = shippingReceiptHelperController.buildUpdatedShippingReceiptPrototype();

			expect(result).to.equal(true);
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.be.defined;
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].status).to.equal(shipping_status);
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].history[0].detail).to.equal(shipping_detail);

		});

		it('successfully builds the updated shipping receipt prototype', () => {

			let shipping_receipt = getValidShippingReceipt();

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipt', shipping_receipt);
			shippingReceiptHelperController.parameters.set('trackingid', shipping_receipt.tracking.id);
			shippingReceiptHelperController.parameters.set('carrier', shipping_receipt.tracking.carrier);
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_receipt.history[0].status);
			shippingReceiptHelperController.parameters.set('shippingdetail', shipping_receipt.history[0].detail);

			let result = shippingReceiptHelperController.buildUpdatedShippingReceiptPrototype();

			expect(result).to.equal(true);
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.be.defined;
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].status).to.equal(shipping_receipt.history[0].status);
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].history[0].detail).to.equal(shipping_receipt.history[0].detail);
			expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].tracking).to.equal(shipping_receipt.tracking);

		});

	});

	describe('updateShippingReceipt', () => {

		it('successfully updates a shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();

			shipping_receipt.status = 'intransit';

			let shipping_status = 'delivered';

			mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
				update({entity}) {
					entity.updated_at = timestamp.getISO8601();
					return Promise.resolve(entity);
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.updateShippingReceipt({shipping_receipt: shipping_receipt, detail: shipping_receipt.history[0].detail, status: shipping_status })
				.then(() => {
					expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt']).to.be.defined;
					expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].status).to.equal(shipping_status);
					return expect(shippingReceiptHelperController.parameters.store['updatedshippingreceipt'].history[0].detail).to.equal(shipping_receipt.history[0].detail);
				});

		});

	});

	describe('confirmShippingReceiptStati', () => {

		it('successfully confirms a shipping receipt status', () => {

			let shipping_stati = ['unknown','intransit','delivered', 'returned'];

			arrayutilities.map(shipping_stati, shipping_status => {

				let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

					shipping_receipt.status = shipping_status;

					if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

						shipping_receipt.tracking = {
							carrier: 'USPS',
							id: randomutilities.createRandomString(20)
						};

						shipping_receipt.history = [{
							status: shipping_status,
							created_at: timestamp.getISO8601(),
							detail: ''
						}];

					}

					return shipping_receipt;

				});

				let shippingReceiptHelperController = new ShippingReceiptHelperController();

				shippingReceiptHelperController.parameters.set('shippingreceipts', shipping_receipts);
				shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

				let result = shippingReceiptHelperController.confirmShippingReceiptStati();

				expect(result).to.equal(true);

			});

		});

		it('returns null when shipping receipts are not set', () => {

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipts', []);
			shippingReceiptHelperController.parameters.set('shippingstatus', 'unknown'); //valid status

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(null);
		});

		it('returns false when shipping receipt status is an unexpected value', () => {

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipts', [getValidShippingReceipt()]);
			shippingReceiptHelperController.parameters.set('shippingstatus', 'unknown'); //valid status

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

		it('returns false when tracking id is missing in "intransit" status', () => {

			let shipping_receipt = getValidShippingReceipt();

			let status = 'intransit'; //when status is intransit

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingstatus', status);
			shipping_receipt.status = status;

			shippingReceiptHelperController.parameters.set('shippingreceipts', [shipping_receipt]);

			//prepare test
			delete shipping_receipt.tracking.id;

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

		it('returns false when tracking carrier is missing in "intransit" status', () => {

			let shipping_receipt = getValidShippingReceipt();

			let status = 'intransit'; //when status is intransit

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingstatus', status);
			shipping_receipt.status = status;

			shippingReceiptHelperController.parameters.set('shippingreceipts', [shipping_receipt]);

			//prepare test
			delete shipping_receipt.tracking.carrier;

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

		it('returns false when tracking id is missing in "delivered" status', () => {

			let shipping_receipt = getValidShippingReceipt();

			let status = 'delivered'; //when status is in delivered state

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingstatus', status);
			shipping_receipt.status = status;

			shippingReceiptHelperController.parameters.set('shippingreceipts', [shipping_receipt]);

			//prepare test
			delete shipping_receipt.tracking.id;

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

		it('returns false when tracking carrier is missing in "delivered" status', () => {

			let shipping_receipt = getValidShippingReceipt();

			let status = 'delivered'; //when status is in delivered state

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingstatus', status);
			shipping_receipt.status = status;

			shippingReceiptHelperController.parameters.set('shippingreceipts', [shipping_receipt]);

			//prepare test
			delete shipping_receipt.tracking.carrier;

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

		it('returns false when history is missing in "delivered" status', () => {

			let shipping_receipt = getValidShippingReceipt();

			let status = 'delivered'; //when status is in delivered state

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingstatus', status);
			shipping_receipt.status = status;

			shippingReceiptHelperController.parameters.set('shippingreceipts', [shipping_receipt]);

			//prepare test
			delete shipping_receipt.history;

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);
		});

	});

	it('successfully fails to confirm a shipping receipt status', () => {

		let shipping_stati = ['unknown','intransit','delivered', 'returned'];

		arrayutilities.map(shipping_stati, shipping_status => {

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				shipping_receipt.status = 'not that';

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipts', shipping_receipts);
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);

		});

	});

	it('successfully fails to confirm a shipping receipt status (missing tracking property)', () => {

		let shipping_stati = ['unknown','intransit','delivered', 'returned'];

		arrayutilities.map(shipping_stati, shipping_status => {

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				shipping_receipt.status = 'not that';

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.store['shippingreceipts'] = shipping_receipts;
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);

		});

	});

	it('successfully fails to confirm a shipping receipt status (missing tracking property)', () => {

		let shipping_stati = ['unknown','intransit','delivered', 'returned'];

		arrayutilities.map(shipping_stati, shipping_status => {

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				shipping_receipt.status = 'not that';

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier:'USPS'
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.store['shippingreceipts'] = shipping_receipts;
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);

		});

	});

	it('successfully fails to confirm a shipping receipt status (missing history)', () => {

		let shipping_stati = ['unknown','intransit','delivered', 'returned'];

		arrayutilities.map(shipping_stati, shipping_status => {

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				shipping_receipt.status = 'not that';

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

				}

				return shipping_receipt;

			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipts', shipping_receipts);
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);

		});

	});

	it('successfully fails to confirm a shipping receipt status (missing history element with matching status)', () => {

		let shipping_stati = ['delivered'];

		arrayutilities.map(shipping_stati, shipping_status => {

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				shipping_receipt.status = shipping_status;

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: (shipping_status == 'delivered')?'something else entirely':shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceipts', shipping_receipts);
			shippingReceiptHelperController.parameters.set('shippingstatus', shipping_status);

			let result = shippingReceiptHelperController.confirmShippingReceiptStati();

			expect(result).to.equal(false);

		});

	});

	describe('acquireShippingReceipts', () => {

		it('successfully acquires shipping receipts', () => {

			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

			return shippingReceiptHelperController.acquireShippingReceipts().then(result => {
				expect(result).to.equal(true);
				return expect(shippingReceiptHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
			});

		});

		it('successfully acquires shipping receipts when shipping receipt controller is already set', () => {

			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			shippingReceiptHelperController.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			shippingReceiptHelperController.shippingReceiptController.getListByAccount = () => {
				return Promise.resolve({shippingreceipts: shipping_receipts});
			};

			shippingReceiptHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

			return shippingReceiptHelperController.acquireShippingReceipts().then(result => {
				expect(result).to.equal(true);
				return expect(shippingReceiptHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
			});

		});

	});

	describe('confirmStati', () => {

		it('successfully executes (unknown)', () => {

			let shipping_status = 'unknown';

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				mockery.resetCache();
				mockery.deregisterAll();

				shipping_receipt.status = shipping_status;

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.confirmStati({shipping_receipt_ids: shipping_receipt_ids, shipping_status: shipping_status})
				.then((result) => {
					return expect(result).to.equal(true);
				});

		});

		it('successfully executes (intransit)', () => {

			let shipping_status = 'intransit';

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				mockery.resetCache();
				mockery.deregisterAll();

				shipping_receipt.status = shipping_status;

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.confirmStati({shipping_receipt_ids: shipping_receipt_ids, shipping_status: shipping_status})
				.then((result) => {
					return expect(result).to.equal(true);
				});

		});

		it('successfully executes (delivered)', () => {

			let shipping_status = 'delivered';

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				mockery.resetCache();
				mockery.deregisterAll();

				shipping_receipt.status = shipping_status;

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.confirmStati({shipping_receipt_ids: shipping_receipt_ids, shipping_status: shipping_status})
				.then((result) => {
					return expect(result).to.equal(true);
				});

		});

		it('successfully executes (returned)', () => {

			let shipping_status = 'returned';

			let shipping_receipts = arrayutilities.map(getValidShippingReceipts(), shipping_receipt => {

				mockery.resetCache();
				mockery.deregisterAll();

				shipping_receipt.status = shipping_status;

				if(_.includes(['intransit', 'delivered', 'returned'], shipping_status)){

					shipping_receipt.tracking = {
						carrier: 'USPS',
						id: randomutilities.createRandomString(20)
					};

					shipping_receipt.history = [{
						status: shipping_status,
						created_at: timestamp.getISO8601(),
						detail: ''
					}];

				}

				return shipping_receipt;

			});

			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				getListByAccount() {
					return Promise.resolve({shippingreceipts: shipping_receipts});
				}
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.confirmStati({shipping_receipt_ids: shipping_receipt_ids, shipping_status: shipping_status})
				.then((result) => {
					return expect(result).to.equal(true);
				});

		});

	});

});
