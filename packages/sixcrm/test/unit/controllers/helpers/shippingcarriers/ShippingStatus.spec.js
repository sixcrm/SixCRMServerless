
const _ = require('lodash');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
let expect = chai.expect;
const mockery = require('mockery');

let du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
let randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
let timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
let objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidTrackerResponse({status, delivered, detail}){

	status = (_.isUndefined(status) || _.isNull(status))?'delivered':status;
	delivered = (_.isUndefined(delivered) || _.isNull(delivered))?true:delivered;
	detail = (_.isUndefined(detail) || _.isNull(detail))?'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.':detail;

	return {
		getVendorResponse: () => {
			return {
				delivered: delivered,
				status: status,
				detail: detail
			};
		}
	};

}

function getValidShippingReceipt(){

	return MockEntities.getValidShippingReceipt();

}

describe('/controllers/helpers/shippingcarriers/ShippingStatus.js', () => {

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
		it('successfully constructs', () => {
			const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
			let shippingStatusController = new ShippingStatusController();

			expect(objectutilities.getClassName(shippingStatusController)).to.equal('ShippingStatusController');
		});
	});

	describe('getStatus', () => {

		it('successfully returns shipping provider status', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.history;

			let tracker_response = getValidTrackerResponse('USPS');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), class {
				constructor(){}
				updateShippingReceipt(argumentation_object){
					shipping_receipt.history = []
					return Promise.resolve(shipping_receipt);
				}
				getTrackingNumber(shipping_receipt, fatal){
					return shipping_receipt.tracking.id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
				constructor() {

				}
				info({shipping_receipt}){
					return Promise.resolve(tracker_response);
				}
			});

			const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
			let shippingStatusController = new ShippingStatusController();

			return shippingStatusController.getStatus({shipping_receipt: shipping_receipt}).then(result => {
				expect(result).to.deep.equal(tracker_response);
				expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

			});

		});

	});

	describe('isDelivered', () => {

		it('successfully returns boolean delivered status (true)', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.history;

			let tracker_response = getValidTrackerResponse('USPS');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), class {
				constructor(){}
				updateShippingReceipt(argumentation_object){
					shipping_receipt.history = []
					return Promise.resolve(shipping_receipt);
				}
				getTrackingNumber(shipping_receipt, fatal){
					return shipping_receipt.tracking.id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
				constructor() {

				}
				info({shipping_receipt}){
					return Promise.resolve(tracker_response);
				}
			});

			const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
			let shippingStatusController = new ShippingStatusController();

			return shippingStatusController.isDelivered({shipping_receipt: shipping_receipt}).then(result => {

				expect(result).to.equal(true);
				expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

			});

		});

		it('successfully returns boolean delivered status (false)', () => {

			let shipping_receipt = getValidShippingReceipt();

			delete shipping_receipt.history;

			let tracker_response = getValidTrackerResponse({status: 'instransit', delivered: false, detail: 'Elvis has left the building.'});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/shippingreceipt/ShippingReceipt.js'), class {
				constructor(){}
				updateShippingReceipt(argumentation_object){
					shipping_receipt.history = []
					return Promise.resolve(shipping_receipt);
				}
				getTrackingNumber(shipping_receipt, fatal){
					return shipping_receipt.tracking.id;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/tracker/Tracker.js'), class {
				constructor() {

				}
				info({shipping_receipt}){
					return Promise.resolve(tracker_response);
				}
			});

			const ShippingStatusController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingStatus.js');
			let shippingStatusController = new ShippingStatusController();

			return shippingStatusController.isDelivered({shipping_receipt: shipping_receipt}).then(result => {

				expect(result).to.equal(false);
				expect(shippingStatusController.parameters.store['shippingreceipt']).to.have.property('history');

			});

		});

	});

});
