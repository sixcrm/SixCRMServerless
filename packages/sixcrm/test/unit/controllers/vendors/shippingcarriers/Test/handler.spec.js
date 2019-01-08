

const _ = require('lodash');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = require('@6crm/sixcrmcore/util/debug-utilities').default;
let randomutilities = require('@6crm/sixcrmcore/util/random').default;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

let MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidTrackingNumber(){
	return MockEntities.getValidTrackingNumber('Test');
}


function getValidAPIResponse(tracking_number, type){

	type = (_.isUndefined(type))?'success':type;

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber():tracking_number;

	if(type == 'success'){
		return {
			statusCode: 200,
			body: {
				success: true,
				code: 200,
				response:
        { tracking_number: tracking_number,
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
	}

	return {
		statusCode: 200,
		body: {
			success: true,
			code: 200,
			response:
      { tracking_number: tracking_number,
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

}

describe('vendors/shippingcarriers/Test/handler.js', () => {

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

			const TestController = global.SixCRM.routes.include('vendors','shippingcarriers/Test/handler.js');
			let testController = new TestController();

			expect(objectutilities.getClassName(testController)).to.equal('TestController');

		});

	});

	describe('info', () => {

		it('successfully executes', () => {

			let tracking_number = getValidTrackingNumber();
			let api_response = getValidAPIResponse(tracking_number);

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, '');
			});

			const TestController = global.SixCRM.routes.include('vendors','shippingcarriers/Test/handler.js');
			let testController = new TestController();

			return testController.info({tracking_number: tracking_number}).then(result => {
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getParsedResponse().tracking_number).to.equal(tracking_number);
				expect(result.getParsedResponse().status).to.be.defined;
				expect(result.getParsedResponse().detail).to.be.defined;
			});

		});

	});

});
