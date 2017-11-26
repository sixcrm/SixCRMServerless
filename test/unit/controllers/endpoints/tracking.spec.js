'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

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

function getValidEvent(){

  return {
    resource: '/tracking/{account}',
    path: '/tracking/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
      path: '/tracking/d3fa3bf3-7824-49f4-8261-87674482bf1c',
      accountId: '068070110666',
      resourceId: '7s02w8',
      stage: 'development',
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
      resourcePath: '/tracking/{account}',
      httpMethod: 'POST',
      apiId: '8jmwnwcaic'
    },
    body: JSON.stringify(getValidEventBody()),
    isBase64Encoded: false
  };

}

function getValidEventBody(){
  return {
    campaign: uuidV4(),
    affiliate_id: randomutilities.createRandomString(20)
  }
}

function getValidAffiliate(){

  return {
    id: uuidV4(),
		account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
		name: randomutilities.createRandomString(15),
		affiliate_id: randomutilities.createRandomString(20),
		created_at: timestamp.getISO8601(),
		updated_at: timestamp.getISO8601()
  };

}

function getValidCampaign(){

  return {
    id:uuidV4(),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    name: randomutilities.createRandomString(15),
    allow_prepaid: false,
    show_prepaid: false,
    productschedules: [uuidV4(), uuidV4()],
    emailtemplates:[uuidV4(), uuidV4()],
    affiliate_allow:[uuidV4()],
    affiliate_deny:["*"],
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
  };

}

function getValidTrackers({campaigns, affiliates}){

  campaigns = (_.isUndefined(campaigns))?[]:campaigns;
  affiliates = (_.isUndefined(affiliates))?[]:affiliates;

  return [
    {
      id:uuidV4(),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		affiliates:affiliates,
  		campaigns:campaigns,
  		type:"html",
  		name: randomutilities.createRandomString(30),
  	  body:randomutilities.createRandomString(15),
  		created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    },
    {
      id:uuidV4(),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		affiliates:affiliates,
  		campaigns:campaigns,
  		type:"html",
  		name: randomutilities.createRandomString(30),
  	  body:randomutilities.createRandomString(15),
  		created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }
  ];

}

describe('tracking', () => {

  beforeEach(() => {
    mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
    });
    mockery.resetCache();
    mockery.deregisterAll();
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {
    it('successfully constructs', () => {

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      expect(objectutilities.getClassName(trackingController)).to.equal('TrackingController');

    });
  });

  describe('execute', () => {

    it('successfully runs execute method', () => {

      let event = getValidEvent();

      let campaign = getValidCampaign();

      campaign.id = JSON.parse(event.body).campaign;

      let affiliate = getValidAffiliate();

      affiliate.affiliate_id = JSON.parse(event.body).affiliate_id;

      let trackers = getValidTrackers({campaigns:[campaign.id], affiliates:[affiliate.id]});

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:({id}) => {
          return Promise.resolve({})
        },
        isEmail: (user_string) => {
          return true;
        },
        getUserStrict: (user_string) => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Tracker.js'), {
        listByCampaignAndAffiliate: ({campaign, affiliate, type}) => {
          return Promise.resolve(trackers)
        },
        getResult:(object, field) => {
          return trackers;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Affiliate.js'), {
        getByAffiliateID: (affiliate_id) => {
          return Promise.resolve(affiliate)
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      return trackingController.execute(event).then(result => {
        expect(result).to.deep.equal({trackers: trackers});
      });

    });

  });

  describe('respond', () => {

    it('successfully responds with trackers', () => {

      let trackers = getValidTrackers({campaigns:[uuidV4()], affiliates:[uuidV4()]});

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('trackers', trackers);

      return trackingController.respond().then(result => {
        expect(result).to.deep.equal({trackers: trackers});
      });

    });

  });

  describe('acquireTrackers', () => {

    it('successfully acquires trackers', () => {

      let campaign = getValidCampaign();
      let affiliate = getValidAffiliate();

      let trackers = getValidTrackers({campaigns:[campaign.id], affiliates:[affiliate.id]});

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Tracker.js'), {
        listByCampaignAndAffiliate: ({campaign, affiliate, type}) => {
          return Promise.resolve(trackers)
        },
        getResult:(object, field) => {
          return trackers;
        }
      });

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('campaign', campaign);
      trackingController.parameters.set('affiliate', affiliate);

      return trackingController.acquireTrackers().then(result => {
        expect(result).to.equal(true);
        expect(trackingController.parameters.store['trackers']).to.deep.equal(trackers);
      });

    });

    it('successfully returns no trackers', () => {

      let campaign = getValidCampaign();
      let affiliate = getValidAffiliate();

      let trackers = [];

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Tracker.js'), {
        listByCampaignAndAffiliate: ({campaign, affiliate, type}) => {
          return Promise.resolve(trackers)
        },
        getResult:(object, field) => {
          return trackers;
        }
      });

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('campaign', campaign);
      trackingController.parameters.set('affiliate', affiliate);

      return trackingController.acquireTrackers().then(result => {
        expect(result).to.equal(true);
        expect(trackingController.parameters.store['trackers']).to.deep.equal([]);
      });

    });

  });

  describe('acquireCampaign', () => {

    it('successfully acquires campaign', () => {

      let event_body = getValidEventBody();
      let campaign  = getValidCampaign();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('event', event_body);

      return trackingController.acquireCampaign().then(result => {
        expect(result).to.equal(true);
        expect(trackingController.parameters.store['campaign']).to.deep.equal(campaign);
      });

    });

  });

  describe('acquireAffiliate', () => {

    it('successfully acquires affiliate', () => {

      let event_body = getValidEventBody();
      let affiliate  = getValidAffiliate();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Affiliate.js'), {
        getByAffiliateID: (affiliate_id) => {
          return Promise.resolve(affiliate)
        }
      });

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('event', event_body);

      return trackingController.acquireAffiliate().then(result => {
        expect(result).to.equal(true);
        expect(trackingController.parameters.store['affiliate']).to.deep.equal(affiliate);
      });

    });

  });

  describe('acquireEventProperties', () => {

    it('successfully acquires event properties', () => {

      let event_body = getValidEventBody();
      let affiliate  = getValidAffiliate();
      let campaign  = getValidCampaign();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Affiliate.js'), {
        getByAffiliateID: (affiliate_id) => {
          return Promise.resolve(affiliate)
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

      trackingController.parameters.set('event', event_body);

      return trackingController.acquireEventProperties().then(result => {
        expect(result).to.equal(true);
        expect(trackingController.parameters.store['affiliate']).to.deep.equal(affiliate);
        expect(trackingController.parameters.store['campaign']).to.deep.equal(campaign);
      });

    });

  });

});
