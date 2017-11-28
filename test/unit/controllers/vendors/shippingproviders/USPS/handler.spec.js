'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let randomutilities = global.SixCRM.routes.include('lib', 'random.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidProcessedParsedAPIResponseBody(){

  return {
    status: 'delivered',
    message: 'Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.',
    delivered: true
  }

}

function getValidParsedAPIResponseBody(){

  return {
    TrackResponse: {
      TrackInfo: [
        {
          '$': { ID: 'EJ958083578US' },
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

function getValidAPIResponse(){

  return {
    statusCode: 200,
    statusMessage: 'OK',
    body: getValidAPIResponseBody()
  };

}

function getValidAPIResponseBody(){

  return '<?xml version="1.0"?><TrackResponse><TrackInfo ID="EJ958083578US"><TrackSummary>Your item was delivered at 8:10 am on June 1 in Wilmington DE 19801.</TrackSummary><TrackDetail>May 30 11:07 am NOTICE LEFT WILMINGTON DE 19801.</TrackDetail><TrackDetail>May 30 10:08 am ARRIVAL AT UNIT WILMINGTON DE 19850.</TrackDetail><TrackDetail>May 29 9:55 am ACCEPT OR PICKUP EDGEWATER NJ 07020.</TrackDetail></TrackInfo></TrackResponse>';

}

function getValidRequestXML(){

  return '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+getValidUserID()+'"><TrackID ID="'+getValidTrackingNumber()+'"/></TrackFieldRequest>'

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

describe('vendors/shippingproviders/USPS/handler.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      expect(objectutilities.getClassName(USPSController)).to.equal('USPSController');
    });

  });

  describe('buildRequestXML', () => {

    it('successfully builds a xml request string', () => {

      let tracking_number = getValidTrackingNumber();
      let user_id = getValidUserID();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('trackingnumber', tracking_number);
      USPSController.parameters.set('userid', user_id);

      let result = USPSController.buildRequestXML();

      expect(result).to.equal(true);
      expect(USPSController.parameters.store['requestxml']).to.equal('<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>');

    });

  });

  describe('buildRequestURI', () => {

    it('successfully builds a request URI', () => {

      let tracking_number = getValidTrackingNumber();
      let user_id = getValidUserID();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('trackingnumber', tracking_number);
      USPSController.parameters.set('userid', user_id);

      let result = USPSController.buildRequestXML();

      expect(result).to.equal(true);
      expect(USPSController.parameters.store['requestxml']).to.equal('<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>');

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

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('requesturi', request_uri);

      return USPSController.executeAPIRequest().then(result => {
        expect(result).to.equal(true);
        expect(USPSController.parameters.store['apiresponse']).to.be.defined;
        expect(USPSController.parameters.store['apiresponsebody']).to.be.defined;
        expect(USPSController.parameters.store['apiresponse']).to.equal(api_response);
        expect(USPSController.parameters.store['apiresponsebody']).to.equal(api_response_body);
      });

    });

  });

  describe('validateAPIResponse', () => {

    it('successfully validates API response', () => {

      let api_response = getValidAPIResponse();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('apiresponse', api_response);

      let response = USPSController.validateAPIResponse();

      expect(response).to.equal(true);

    });

    it('successfully throws an error when API response is non-200', () => {

      let api_response = getValidAPIResponse();

      api_response.statusCode = 403;

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('apiresponse', api_response);

      try {
        let response = USPSController.validateAPIResponse();
      }catch(error){
        expect(error.message).to.equal('[500] USPS API returned a non-200 status code: 403');
      }

    });

  });

  describe('acquireAPIResult', () => {

    it('successfully acquires a API response', () => {

      let user_id = getValidUserID();
      let tracking_number = getValidTrackingNumber();
      let api_response = getValidAPIResponse();
      let api_response_body = getValidAPIResponseBody();

      mockery.registerMock('request', (request_uri, callback) => {
        return callback(null, api_response, api_response_body);
      });

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('trackingnumber', tracking_number);
      USPSController.parameters.set('userid', user_id);

      return USPSController.acquireAPIResult().then(result => {
        expect(result).to.equal(true);
        expect(USPSController.parameters.store['apiresponse']).to.be.defined;
        expect(USPSController.parameters.store['apiresponsebody']).to.be.defined;
        expect(USPSController.parameters.store['apiresponse']).to.equal(api_response);
        expect(USPSController.parameters.store['apiresponsebody']).to.equal(api_response_body);
      });

    });

  });

  describe('parseAPIResponseBody', () => {

    it('successfully parses the response body', () => {

      let api_response_body = getValidAPIResponseBody();
      let parsed_api_response_body = getValidParsedAPIResponseBody();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('apiresponsebody', api_response_body);

      return USPSController.parseAPIResponseBody().then(result => {
        expect(result).to.equal(true);
        expect(USPSController.parameters.store['parsedapiresponsebody']).to.be.defined;
        expect(USPSController.parameters.store['parsedapiresponsebody']).to.deep.equal(parsed_api_response_body);
      });

    });

  });

  describe('processParsedAPIResponseBody', () => {

    it('successfully processes parsed API response body', () => {

      let parsed_api_response_body =  getValidParsedAPIResponseBody();
      let processed_parsed_api_response_body = getValidProcessedParsedAPIResponseBody();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('parsedapiresponsebody', parsed_api_response_body);

      return USPSController.processParsedAPIResponseBody().then(result => {
        expect(result).to.equal(true);
        expect(USPSController.parameters.store['processedparsedapiresponsebody']).to.be.defined;
        expect(USPSController.parameters.store['processedparsedapiresponsebody']).to.deep.equal(processed_parsed_api_response_body);
      });

    });

  });

  describe('respond', () => {

    it('successfully responds', () => {

      let processed_parsed_api_response_body = getValidProcessedParsedAPIResponseBody();

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      USPSController.parameters.set('processedparsedapiresponsebody', processed_parsed_api_response_body);

      let result = USPSController.respond();

      expect(objectutilities.getClassName(result)).to.equal('ShippingProviderResponse');
      expect(result.getDelivered()).to.equal(processed_parsed_api_response_body.delivered);
      expect(result.getStatus()).to.equal(processed_parsed_api_response_body.status);
      expect(result.getDetail()).to.equal(processed_parsed_api_response_body.message);

    });

  });

  describe('getStatus', () => {

    it('successfully responds with shipping provider response object', () => {

      let tracking_number = getValidTrackingNumber();
      let api_response = getValidAPIResponse();
      let api_response_body = getValidAPIResponseBody();
      let processed_parsed_api_response_body = getValidProcessedParsedAPIResponseBody();

      mockery.registerMock('request', (request_uri, callback) => {
        return callback(null, api_response, api_response_body);
      });

      let USPSController = global.SixCRM.routes.include('vendors','shippingproviders/USPS/handler.js');

      return USPSController.getStatus(tracking_number).then(result => {

        expect(objectutilities.getClassName(result)).to.equal('ShippingProviderResponse');
        expect(result.getDelivered()).to.equal(processed_parsed_api_response_body.delivered);
        expect(result.getStatus()).to.equal(processed_parsed_api_response_body.status);
        expect(result.getDetail()).to.equal(processed_parsed_api_response_body.message);

      });

    });

  });

});
