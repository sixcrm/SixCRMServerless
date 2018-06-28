
const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidTrackingNumber(carrier){

	return {
		'Test':randomutilities.createRandomString(20),
		'USPS':randomutilities.createRandomString(10)
	}[carrier];

}

function getValidAPIResponse(carrier, tracking_number){

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber(carrier):tracking_number;

	if(carrier == 'Test'){

		return {
			statusCode: 200,
			body: {
				success: true,
				code: 200,
				response:
        { tracking_number: 'Y9Z8F7R2JHLYG4E7AUVB',
        	status: 'delivered',
        	address:
          { name: 'John Doe',
          	line1: '54321 Shrinking Lane',
          	city: 'Miniapolis',
          	state: 'IN',
          	zip: '54321',
          	country: 'US'
          },
        	detail:{
        		detail: 'Delivered to front porch',
        		delivered_at: '2018-01-04T20:11:26.376Z'
        	}
        }
			}
		};

	}else if(carrier == 'USPS'){

		return {
			statusCode: 200,
			body: '<?xml version="1.0" encoding="UTF-8"?>\n<TrackResponse><TrackInfo ID="'+tracking_number+'"><Error><Number>-2147219302</Number><Description>The tracking number may be incorrect or the status update is not yet available. Please verify your tracking number and try again later.</Description><HelpFile/><HelpContext/></Error></TrackInfo></TrackResponse>'
		};

	}

}

function getValidShippingReceipt(){
	return MockEntities.getValidShippingReceipt();
}

describe('controllers/providers/tracker/Tracker.js', function () {

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

			const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
			let trackerController = new TrackerController();

			expect(objectutilities.getClassName(trackerController)).to.equal('TrackerController');

		});

	});

	describe('info', () => {

		it('successfully executes the info method (Test Carrier)', () => {

			let shipping_receipt = getValidShippingReceipt();

			shipping_receipt.tracking = {
				carrier: 'Test',
				id: randomutilities.createRandomString(20)
			};

			let api_response = getValidAPIResponse('Test', shipping_receipt.tracking.id);

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, '');
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
			let trackerController = new TrackerController();

			return trackerController.info({shipping_receipt: shipping_receipt}).then(result => {
				expect(result.getVendorResponse()).to.have.property('detail');
				expect(result.getVendorResponse()).to.have.property('status');
				expect(result.getVendorResponse()).to.have.property('tracking_number');
			});

		});

		it('successfully executes the info method (USPS Carrier)', () => {

			let shipping_receipt = getValidShippingReceipt();

			shipping_receipt.tracking = {
				carrier: 'USPS',
				id: randomutilities.createRandomString(20)
			};

			let api_response = getValidAPIResponse('USPS', shipping_receipt.tracking.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				get() {
					return Promise.resolve(shipping_receipt);
				}
			});

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, '');
			});

			const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
			let trackerController = new TrackerController();

			return trackerController.info({shipping_receipt: shipping_receipt}).then(result => {
				expect(result.getVendorResponse()).to.have.property('detail');
				expect(result.getVendorResponse()).to.have.property('status');
				expect(result.getVendorResponse()).to.have.property('tracking_number');
			});

		});

	});

});
