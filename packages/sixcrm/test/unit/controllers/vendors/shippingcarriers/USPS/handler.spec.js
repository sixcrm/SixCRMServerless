

const _ = require('lodash');

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
let randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
let objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

function getValidParsedAPIResponseBody(tracking_number){

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber():tracking_number;

	return {
		TrackResponse: {
			TrackInfo: [
				{
					'$': { ID: tracking_number },
					TrackSummary: [ 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.' ],
					TrackDetail: [
						'May 30 11:07 am NOTICE LEFT WILMINGTON DE 19801.',
						'May 30 10:08 am ARRIVAL AT UNIT WILMINGTON DE 19850.',
						'May 29 9:55 am ACCEPT OR PICKUP EDGEWATER NJ 07020.'
					]
				}
			]
		}
	};

}

function getValidAPIResponse(tracking_number, type){

	type = (_.isUndefined(type))?'success':type;

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber():tracking_number;

	return {
		statusCode: 200,
		statusMessage: 'OK',
		body: getValidAPIResponseBody(tracking_number, type)
	};

}

function getValidAPIResponseBody(tracking_number, type){

	type = (_.isUndefined(type))?'success':type;

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber():tracking_number;

	if(type == 'success'){
		return '<?xml version="1.0"?><TrackResponse><TrackInfo ID="'+tracking_number+'"><TrackSummary>Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.</TrackSummary><TrackDetail>May 30 11:07 am NOTICE LEFT WILMINGTON DE 19801.</TrackDetail><TrackDetail>May 30 10:08 am ARRIVAL AT UNIT WILMINGTON DE 19850.</TrackDetail><TrackDetail>May 29 9:55 am ACCEPT OR PICKUP EDGEWATER NJ 07020.</TrackDetail></TrackInfo></TrackResponse>';
	}

	return '<?xml version="1.0" encoding="UTF-8"?>\n<TrackResponse><TrackInfo ID="'+tracking_number+'"><Error><Number>-2147219302</Number><Description>The tracking number may be incorrect or the status update is not yet available. Please verify your tracking number and try again later.</Description><HelpFile/><HelpContext/></Error></TrackInfo></TrackResponse>'

}

function getValidRequestXML(tracking_number){

	tracking_number = (_.isUndefined(tracking_number))?getValidTrackingNumber():tracking_number;

	return '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+getValidUserID()+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>'

}

function getValidRequestURI(){

	return 'http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML='+encodeURIComponent(getValidRequestXML());

}

function getValidTrackingNumber(){

	return randomutilities.createRandomString(12);

}

function getValidUserID(){

	return randomutilities.createRandomString(12);

}

describe('vendors/shippingcarriers/USPS/handler.js', () => {

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

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			expect(objectutilities.getClassName(uSPSController)).to.equal('USPSController');
		});

	});

	describe('buildRequestXML', () => {

		it('successfully builds a xml request string', () => {

			let tracking_number = getValidTrackingNumber();
			let user_id = getValidUserID();

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			uSPSController.parameters.set('trackingnumber', tracking_number);
			uSPSController.parameters.set('userid', user_id);

			let result = uSPSController.buildRequestXML();

			expect(result).to.equal(true);
			expect(uSPSController.parameters.store['requestxml']).to.equal('<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>');

		});

	});

	describe('buildRequestURI', () => {

		it('successfully builds a request URI', () => {

			let tracking_number = getValidTrackingNumber();
			let user_id = getValidUserID();

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			uSPSController.parameters.set('trackingnumber', tracking_number);
			uSPSController.parameters.set('userid', user_id);

			let result = uSPSController.buildRequestXML();

			expect(result).to.equal(true);
			expect(uSPSController.parameters.store['requestxml']).to.equal('<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>');

		});

	});

	describe('executeAPIRequest', () => {

		it('successfully executes a API request', () => {

			let request_uri = getValidRequestURI();
			let api_response = getValidAPIResponse();
			let api_response_body = getValidAPIResponseBody();

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, api_response_body);
			});

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			uSPSController.parameters.set('requesturi', request_uri);

			return uSPSController.executeAPIRequest().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

	describe('info', () => {

		it('successfully executes', () => {

			let tracking_number = getValidTrackingNumber();

			let api_response = getValidAPIResponse(tracking_number);
			let api_response_body = getValidAPIResponseBody(tracking_number);

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, api_response_body);
			});

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			return uSPSController.info({tracking_number: tracking_number}).then(result => {
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getParsedResponse().tracking_number).to.equal(tracking_number);
				expect(result.getParsedResponse().status).to.be.defined;
				expect(result.getParsedResponse().detail).to.be.defined;
			});

		});

		it('successfully executes with unrecognized tracking number', () => {

			let tracking_number = getValidTrackingNumber();

			let api_response = getValidAPIResponse(tracking_number, 'fail');
			let api_response_body = getValidAPIResponseBody(tracking_number, 'fail');

			mockery.registerMock('request', (request_uri, callback) => {
				return callback(null, api_response, api_response_body);
			});

			const USPSController = global.SixCRM.routes.include('vendors','shippingcarriers/USPS/handler.js');
			let uSPSController = new USPSController();

			return uSPSController.info({tracking_number: tracking_number}).then(result => {
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getParsedResponse().tracking_number).to.equal(tracking_number);
				expect(result.getParsedResponse().status).to.equal('unknown');
				expect(result.getParsedResponse().detail).to.be.defined;
			});

		});

	});

});
