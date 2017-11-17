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

function getValidLambdaPOSTEvent(){

  return {
    resource: '/token/acquire/{account}',
    path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
    httpMethod: 'POST',
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      Authorization: '1ud98uhc9h989811ud01yd81u2d1289duu1du1a0d9uula:1510882985745:022eaf08f2d19bb0b198b34c5d0721d9ecb8a274',
      'CloudFront-Forwarded-Proto': 'https',
      'CloudFront-Is-Desktop-Viewer': 'true',
      'CloudFront-Is-Mobile-Viewer': 'false',
      'CloudFront-Is-SmartTV-Viewer': 'false',
      'CloudFront-Is-Tablet-Viewer': 'false',
      'CloudFront-Viewer-Country': 'US',
      'Content-Type': 'application/json',
      Host: 'development-api.sixcrm.com',
      'User-Agent': 'node-superagent/2.3.0',
      Via: '1.1 e1fff2dee56e3b55796cc594a92413c0.cloudfront.net (CloudFront)',
      'X-Amz-Cf-Id': 'auxn3Iv21qv3qMmcsVjlQxF86zRvidB4jV2XkHx3rdJ94iRatjLc_A==',
      'X-Amzn-Trace-Id': 'Root=1-5a0e3ea9-151c05ec1d5ebffe14d11acf',
      'X-Forwarded-For': '71.193.160.163, 52.46.16.55',
      'X-Forwarded-Port': '443',
      'X-Forwarded-Proto': 'https'
    },
    queryStringParameters: null,
    pathParameters: { account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c' },
    stageVariables: null,
    requestContext:{
      path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
      accountId: '068070110666',
      resourceId: '7s02w8',
      stage: 'development',
      authorizer: {
        principalId: 'user',
        user: 'super.user@test.com'
      },
      requestId: 'a837419c-cb38-11e7-ad83-af785c8f6952',
      identity:{
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        apiKey: '',
        sourceIp: '71.193.160.163',
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'node-superagent/2.3.0',
        user: null
      },
      resourcePath: '/token/acquire/{account}',
      httpMethod: 'POST',
      apiId: '8jmwnwcaic'
    },
    body: '{"campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9","affiliates":{"affiliate":"ZC9HCFCTGZ","subaffiliate_1":"MMCSENES99","subaffiliate_2":"7YR4T5345D","subaffiliate_3":"9H24CJCXEV","subaffiliate_4":"FGTLJ5NEJU","subaffiliate_5":"6Y2CRE5QN9","cid":"5JN5LHRVZR"}}',
    isBase64Encoded: false
  }

}

function getValidLocalPOSTEvent(){

  return JSON.stringify(getValidLambdaPOSTEvent());

}

function getValidPOSTEvent(){

  return getValidLambdaPOSTEvent();

}

function getValidGETEvent(){

  let event = getValidPOSTEvent();

  event.queryStringParameters = 'session=668ad918-0d09-4116-a6fe-0e8a9eda36f7';
  event.httpMethod = 'GET'
  delete event.body;
  return event;

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

      let event = getValidPOSTEvent();

      return endpointController.acquireBody(event).then(result => {
        expect(result).to.deep.equal(JSON.parse(event.body));
      });

    });

    it('successfully acquires a JSON object body', () => {

      let endpointController = new EndpointController();

      let event = getValidPOSTEvent();

      event.body = JSON.parse(event.body);

      return endpointController.acquireBody(event).then(result => {
        expect(result).to.deep.equal(event.body);
      });

    });

    it('throws an error when neither case resolves', () => {

      let endpointController = new EndpointController();

      let event = getValidPOSTEvent();

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

      let event = getValidPOSTEvent();

      let endpointController = new EndpointController();

      return endpointController.acquirePathParameters(event).then(result => {
        expect(result).to.deep.equal(event);
        expect(endpointController.pathParameters).to.deep.equal(event.pathParameters);
      });

    });

    it('throws an error when event does not have pathParameters property.', () => {

      let event = getValidPOSTEvent();

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

  describe('normalize event', () => {

    it('successfully normalizes events', () => {

      let test_case = {
        lambda:getValidLambdaPOSTEvent(),
        local:getValidPOSTEvent()
      }

      let endpointController = new EndpointController();
      let lambda;
      let local;

      return endpointController.normalizeEvent(test_case.lambda).then(result => { lambda = result; })
      .then(() => endpointController.normalizeEvent(test_case.local)).then(result => { local = result; })
      .then(() => {
        expect(local).to.deep.equal(lambda);
      });

    });

  });

  describe('validateEvent', () => {

    it('validates a good event', () => {

      let event = getValidPOSTEvent();
      let endpointController = new EndpointController();

      return endpointController.validateEvent(event).then(result => {
        expect(result).to.deep.equal(event);
      });

    });

    it('validates a good event', () => {

      let event = getValidGETEvent();
      let endpointController = new EndpointController();

      return endpointController.validateEvent(event).then(result => {
        expect(result).to.deep.equal(event);
      });

    });

    it('throws error when path parameter is missing', () => {

      let event = getValidPOSTEvent();

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

        let event = getValidPOSTEvent();

        event.pathParameters = bad_types;

        try{
          endpointController.validateEvent(event);
        }catch(error){
          expect(error.message).to.equal('[400] Unexpected event structure.');
        }

      });

    });

    it('throws error when requestContext is missing', () => {

      let event = getValidPOSTEvent();

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

        let event = getValidPOSTEvent();

        event.requestContext = bad_types;

        try{
          endpointController.validateEvent(event);
        }catch(error){
          expect(error.message).to.equal('[400] Unexpected event structure.');
        }

      });

    });

  });

  xdescribe('parseEvent',   () => {

    it('successfully parses a good event', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good encoded event', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

      event = JSON.stringify(event);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where requestContext is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where pathParameters is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

      event.pathParameters = JSON.parse(event.pathParameters);

      return endpointController.parseEvent(event).then(result => {
        expect(result).to.have.property('requestContext');
        expect(result).to.have.property('pathParameters');
      });

    });

    it('successfully parses a good event where pathParameters and requestObject are both objects', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

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
      let event = getValidPOSTEvent();

      event.requestContext = 'blerg';

      try{
        endpointController.parseEvent(event);
      }catch(error){
        expect(error.message).to.equal('[400] Unexpected event structure.');
      }

    });

    it('fails where event.pathParameters is not a parseable object', () => {

      let endpointController = new EndpointController();
      let event = getValidPOSTEvent();

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
      let event = getValidGETEvent();
      let parsed_querystring = querystring.parse(event.queryStringParameters);

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result.queryStringParameters).to.deep.equal(parsed_querystring);

      });

    });

    it('successfully returns when queryStringParameters is a object', () => {

      let endpointController = new EndpointController();
      let event = getValidGETEvent();

      event.queryStringParameters = querystring.parse(event.queryStringParameters);

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result.queryStringParameters).to.deep.equal(event.queryStringParameters);

      });

    });

    it('successfully returns when queryStringParameters is not set', () => {

      let endpointController = new EndpointController();
      let event = getValidGETEvent();

      delete event.queryStringParameters

      return endpointController.parseEventQueryString(event).then(result => {

        expect(result).to.deep.equal(event);

      });

    });

    it('throws an error when queryStringParameters is not parsable', () => {

      let endpointController = new EndpointController();
      let event = getValidGETEvent();
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
