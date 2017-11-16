'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const querystring = require('querystring');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const EndpointController = global.SixCRM.routes.include('controllers', 'endpoints/endpoint.js');

function getValidPostEvent(){

  return {
  	"Authorization":"ae31c39cb9c30a027cf6c0a612a813d33bc23b6e:1483824904139:476d523132b619457a726d1792baeaec8b1221d4",
  	"requestContext":"{\"authorizer\":{\"user\":\"4ee23a8f5c8661612075a89e72a56a3c6d00df90\"}}",
  	"pathParameters":"{ \"account\": \"d3fa3bf3-7824-49f4-8261-87674482bf1c\" }",
  	"body": "{\"campaign\": \"70a6689a-5814-438b-b9fd-dd484d0812f9\",\"affiliates\":{\"affiliate\": \"9577X23DGX\",\"subaffiliate_1\": \"AGLPB9FLPA\",\"subaffiliate_2\": \"RCF2PFE74V\",\"subaffiliate_3\": \"D82HM7P4LJ\",\"subaffiliate_4\": \"FCLN8Z5XKP\",\"subaffiliate_5\": \"37Q1YH1LEM\",\"cid\": \"3ABBQ7XRMF\"}}"
  };

}

function getValidGetEvent(){

  return {
  	"Authorization":"ae31c39cb9c30a027cf6c0a612a813d33bc23b6e:1483824904139:476d523132b619457a726d1792baeaec8b1221d4",
  	"requestContext":"{\"authorizer\":{\"user\":\"4ee23a8f5c8661612075a89e72a56a3c6d00df90\"}}",
  	"pathParameters":"{ \"account\": \"d3fa3bf3-7824-49f4-8261-87674482bf1c\" }",
  	"queryStringParameters":"session=668ad918-0d09-4116-a6fe-0e8a9eda36f7"
  };

}



describe('controllers/endpoints/endpoint.js', () => {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let endpointController = new EndpointController();

      expect(objectutilities.getClassName(endpointController)).to.equal('EndpointController');
    });
  });

  describe('clearState', () => {
    it('successfully clears the state', () => {
      let endpointController = new EndpointController();

      endpointController.pathParameters = 'ack';
      endpointController.queryString = 'gack';
      endpointController.clearState();
      expect(endpointController.pathParameters).to.equal(undefined);
      expect(endpointController.queryString).to.equal(undefined);
    });
  });

  describe('acquireBody', () => {

    it('successfully acquires a JSON string body', () => {

      let endpointController = new EndpointController();

      let event = getValidPostEvent();

      return endpointController.acquireBody(event).then(result => {
        expect(result).to.deep.equal(JSON.parse(event.body));
      });

    });

    it('successfully acquires a JSON object body', () => {

      let endpointController = new EndpointController();

      let event = getValidPostEvent();

      event.body = JSON.parse(event.body);

      return endpointController.acquireBody(event).then(result => {
        expect(result).to.deep.equal(event.body);
      });

    });

    it('throws an error when neither case resolves', () => {

      let endpointController = new EndpointController();

      let event = getValidPostEvent();

      event.body = 'blarg';

      try{
        endpointController.acquireBody({});
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

  });

  describe('acquirePathParameters', () => {

    it('sets path parameters', () => {

      let event = getValidPostEvent();

      let endpointController = new EndpointController();

      return endpointController.acquirePathParameters(event).then(result => {
        expect(result).to.deep.equal(event);
        expect(endpointController.pathParameters).to.deep.equal(event.pathParameters);
      });

    });

    it('throws an error when event does not have pathParameters property.', () => {

      let event = getValidPostEvent();

      delete event.pathParameters;

      let endpointController = new EndpointController();

      endpointController.pathParameters = 'something';

      try{
        endpointController.acquirePathParameters(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
        expect(endpointController.pathParameters).to.equal(undefined);
      }

    });

  });

  describe('validateEvent', () => {

    it('validates a good event', () => {

      let event = getValidPostEvent();
      let endpointController = new EndpointController();

      return endpointController.validateEvent(event).then(result => {
        expect(result).to.deep.equal(event);
      });

    });

    it('throws error when path parameter is missing', () => {

      let event = getValidPostEvent();

      delete event.pathParameters;

      let endpointController = new EndpointController();

      try{
        endpointController.validateEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

    it('throws error when path parameter is incorrect type', () => {

      let endpointController = new EndpointController();
      let bad_types = [123, null, {}, () => {}, 3.2];

      arrayutilities.map(bad_types, bad_type => {

        let event = getValidPostEvent();

        event.pathParameters = bad_types;

        try{
          endpointController.validateEvent(event);
        }catch(error){
          expect(error.message).to.equal('[400] Unexpected event structure.');
        }

      });

    });

    it('throws error when requestContext is missing', () => {

      let event = getValidPostEvent();

      delete event.reequestContext;

      let endpointController = new EndpointController();

      try{
        endpointController.validateEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

    it('throws error when requestContext is incorrect type', () => {

      let endpointController = new EndpointController();
      let bad_types = [123, null, {}, () => {}, 3.2];

      arrayutilities.map(bad_types, bad_type => {

        let event = getValidPostEvent();

        event.requestContext = bad_types;

        try{
          endpointController.validateEvent(event);
        }catch(error){
          expect(error.message).to.equal('[400] Unexpected event structure.');
        }

      });

    });

  });

  describe('parseEvent',   () => {

    it('successfully parses a good event', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good encoded event', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event = JSON.stringify(event);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where requestContext is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event.requestContext = JSON.parse(event.requestContext);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where pathParameters is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event.pathParameters = JSON.parse(event.pathParameters);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where pathParameters and requestObject are both objects', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event.pathParameters = JSON.parse(event.pathParameters);
      event.requestContext = JSON.parse(event.requestContext);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('fails where event is not a parseable object', () => {

      let endpointController = new EndpointController();
      let event = 'blerg';

      try{
        endpointController.parseEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

    it('fails where event.requestContext is not a parseable object', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event.requestContext = 'blerg';

      try{
        endpointController.parseEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

    it('fails where event.pathParameters is not a parseable object', () => {

      let endpointController = new EndpointController();
      let event = getValidPostEvent();

      event.pathParameters = 'blerg';

      try{
        endpointController.parseEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

  });

  describe('parseEventQueryString', () => {

    it('successfully parses encoded querystring parameters', () => {

      let endpointController = new EndpointController();
      let event = getValidGetEvent();
      let parsed_querystring = querystring.parse(event.queryStringParameters);

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result.queryStringParameters).to.deep.equal(parsed_querystring);

      });

    });

    it('successfully returns when queryStringParameters is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidGetEvent();

      event.queryStringParameters = querystring.parse(event.queryStringParameters);

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result.queryStringParameters).to.deep.equal(event.queryStringParameters);

      });

    });

    it('successfully returns when queryStringParameters is not set', () => {

      let endpointController = new EndpointController();
      let event = getValidGetEvent();

      delete event.queryStringParameters

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result).to.deep.equal(event);

      });

    });

    it('throws an error when queryStringParameters is not parsable', () => {

      let endpointController = new EndpointController();
      let event = getValidGetEvent();
      let bad_types = [123, null, {}, () => {}, 3.2, 'somerandostring'];

      arrayutilities.map(bad_types, bad_type => {

        try{
          endpointController.parseEventQueryString(event);
        }catch(error){
          expect(error.message).to.equal('[400] Unexpected event structure.');
        }

      });

    });

  });

  describe('throwUnexpectedEventStructureError', () => {
    it('successfully throws an error', () => {
      let endpointController = new EndpointController();

      try{
        endpointController.throwUnexpectedEventStructureError();
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }
    });
  });

});
