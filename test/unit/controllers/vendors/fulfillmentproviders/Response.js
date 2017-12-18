'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

describe('vendors/fulfillmentproviders/Response.js', () =>{

  describe('constructor', () => {
    it('successfully constructs', () => {
      const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
      let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

      expect(objectutilities.getClassName(fulfillmentResponse)).to.equal('FulfillmentProviderVendorResponse');
    });

    it('fails to construct', () => {
      const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

      try{
        let fulfillmentResponse = new FulfillmentResponse();
      }catch(error){
        expect(error.message).to.be.defined;
      }
    });

    //Technical Debt:  Write validation against bad constructor arguments...
  });

  describe('getFulfillmentProviderName', () => {
    it('successfully acquires the fulfillment provider name', () => {

      const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
      let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

      let result = fulfillmentResponse.getFulfillmentProviderName();

      expect(result).to.equal('FulfillmentProviderVendor');

    });
  });


  describe('handleResponse', () => {
    it('successfully handles response when error is null', () => {

      const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
      let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

      delete fulfillmentResponse.parameters.store['error'];
      delete fulfillmentResponse.parameters.store['response'];
      delete fulfillmentResponse.parameters.store['body'];

      fulfillmentResponse.handleResponse({error: null, response: {}, body:''});
      expect(fulfillmentResponse.parameters.store['error']).to.not.be.defined;

    });

    it('successfully handles response when error is a error', () => {

      const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
      let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

      delete fulfillmentResponse.parameters.store['error'];
      delete fulfillmentResponse.parameters.store['response'];
      delete fulfillmentResponse.parameters.store['body'];

      let error = new Error('Some message');

      fulfillmentResponse.handleResponse({error: error, response: {}, body:''});
      expect(fulfillmentResponse.parameters.store['error']).to.be.defined;

    });
  });

  describe('setResponseProperties', () => {
    it('successfully sets the response properties', () => {

    });
  });

});
