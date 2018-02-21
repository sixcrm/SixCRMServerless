'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidEventPrototype(){

  return objectutilities.merge({
    session: '',
    type: 'click',
    datetime: timestamp.getISO8601(),
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    campaign: uuidV4(),
    product_schedule: '',
  }, getValidAffiliates());

}

function getValidJWT(){
  return  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
}

function getValidEvent(){

  return {
    resource: '/token/acquire/{account}',
    path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
    httpMethod: 'POST',
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0ODM4MzkyMjR9.jW6hbpILFKRJq1bRN_7XaH1ZrqCT_QK8t4udTrLAgts',
      'CloudFront-Forwarded-Proto': 'https',
      'CloudFront-Is-Desktop-Viewer': 'true',
      'CloudFront-Is-Mobile-Viewer': 'false',
      'CloudFront-Is-SmartTV-Viewer': 'false',
      'CloudFront-Is-Tablet-Viewer': 'false',
      'CloudFront-Viewer-Country': 'US',
      'Content-Type': 'application/json',
      Host: 'local-api.sixcrm.com',
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
      stage: 'local',
      authorizer: {
        principalId: 'user',
        user: '4ee23a8f5c8661612075a89e72a56a3c6d00df90'
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
    body: JSON.stringify(getValidEventBody()),
    isBase64Encoded: false
  };

}

function getValidEventBody(){

  return {
    campaign: getValidCampaign().id,
    affiliates: getValidAffiliatesPrototype()
  };

}

function getValidCampaign(id){

  return MockEntities.getValidCampaign(id);

}

function getValidAffiliates(){
  return {
    affiliate: uuidV4(),
    subaffiliate_1: uuidV4(),
    subaffiliate_2: uuidV4(),
    subaffiliate_3: uuidV4(),
    subaffiliate_4: uuidV4(),
    subaffiliate_5: uuidV4(),
    cid: uuidV4()
  };
}

function getValidAffiliatesPrototype(){

  return {
    affiliate: randomutilities.createRandomString(20),
    subaffiliate_1: randomutilities.createRandomString(20),
    subaffiliate_2: randomutilities.createRandomString(20),
    subaffiliate_3: randomutilities.createRandomString(20),
    subaffiliate_4: randomutilities.createRandomString(20),
    subaffiliate_5: randomutilities.createRandomString(20),
    cid: randomutilities.createRandomString(20)
  };

}

describe('acquireToken', () => {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      expect(objectutilities.getClassName(acquireTokenController)).to.equal('AcquireTokenController');
    });
  });

  describe('validateCampaign', () => {

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

    it('successfully validates the campaign', () => {

      let campaign = getValidCampaign();
      let event = getValidEventBody();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:() => {
          return Promise.resolve(campaign);
        }
      });

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.parameters.set('event', event);

      return acquireTokenController.validateCampaign().then(result => {
        expect(result).to.equal(true);
        expect(acquireTokenController.parameters.store['campaign']).to.deep.equal(campaign);
      });

    });

    it('throws an error when the campaign does not validate', () => {

        let event = getValidEventBody();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
          get:() => {
            return Promise.resolve(null);
          }
        });

        let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

        acquireTokenController.parameters.set('event', event);

        return acquireTokenController.validateCampaign().catch((error) => {
            expect(error.message).to.have.string('Invalid Campaign ID:');
        });
    });

  });

  describe('acquireToken', () => {

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

    it('successfully acquires a token', () => {

      let jwt = getValidJWT();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'jwt-utilities'), {
        getJWT: () => {
          return jwt;
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      return acquireTokenController.acquireToken().then(result => {
        expect(result).to.equal(true);
        expect(acquireTokenController.parameters.store['transactionjwt']).to.equal(jwt);
      });
    });

  });

  describe('handleAffiliateInformation', () => {

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

    it('successfully updates the event with affiliate information', () => {

      let event = getValidEventBody();
      let almost_updated_event = objectutilities.clone(event);

      almost_updated_event.affiliates = getValidAffiliates();

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
        constructor(){}
        handleAffiliateInformation(){
          return Promise.resolve(true);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.parameters.set('event', event);
      return acquireTokenController.handleAffiliateInformation().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('postProcessing', () => {

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

    it('successfully executes post processing methods', () => {

      let event = getValidEventBody();
      let almost_updated_event = objectutilities.clone(event);

      almost_updated_event.affiliates = getValidAffiliates();
      let updated_event = objectutilities.merge(almost_updated_event, almost_updated_event.affiliates);

      delete updated_event.affiliates

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
        constructor(){
          this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];
        }
        handleAffiliateInformation(){
          return Promise.resolve(almost_updated_event);
        }
        transcribeAffiliates(source_object, destination_object){
          destination_object = (_.isUndefined(destination_object))?{}:destination_object;
          let affiliate_mapping_object = {};

          arrayutilities.map(this.affiliate_fields, affiliate_field => {
            affiliate_mapping_object[affiliate_field] = affiliate_field;
          });
          return objectutilities.transcribe(affiliate_mapping_object, source_object, destination_object, false);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve('some-sns-message-id');
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.parameters.set('event', event);

      let result = acquireTokenController.postProcessing();

      expect(result).to.equal(true);


    });
  });

  describe('execute', () => {

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

    it('successfully executes', () => {

      let event = getValidEvent();
      let campaign = getValidCampaign();
      let jwt = getValidJWT();
      let almost_updated_event = objectutilities.clone(getValidEventBody());

      almost_updated_event.affiliates = getValidAffiliates();
      let updated_event = objectutilities.merge(almost_updated_event, almost_updated_event.affiliates);

      delete updated_event.affiliates

      mockery.registerMock(global.SixCRM.routes.path('lib', 'jwt-utilities'), {
        getJWT: () => {
          return jwt;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:() => {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:() => {
          return Promise.resolve({})
        },
        isEmail: () => {
          return true;
        },
        getUserStrict: () => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
        constructor(){
          this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];
        }
        handleAffiliateInformation(){
          return Promise.resolve(almost_updated_event);
        }
        transcribeAffiliates(source_object, destination_object){
          destination_object = (_.isUndefined(destination_object))?{}:destination_object;
          let affiliate_mapping_object = {};

          arrayutilities.map(this.affiliate_fields, affiliate_field => {
            affiliate_mapping_object[affiliate_field] = affiliate_field;
          });
          return objectutilities.transcribe(affiliate_mapping_object, source_object, destination_object, false);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve('some-sns-message-id');
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.createEventObject = () => { return getValidEventPrototype(); }

      return acquireTokenController.execute(event).then(result => {
        expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'definitions/jwt.json'))).to.equal(true);
      });

    });
  });

});
