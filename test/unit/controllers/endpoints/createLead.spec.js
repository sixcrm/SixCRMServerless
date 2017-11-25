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

function getValidCustomer(){

  return objectutilities.merge(getValidCustomerPrototype(), {
    id:uuidV4(),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    created_at:timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  });

}

function getLocalEvent(){

  return JSON.stringify(getValidEvent());

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
      path: '/lead/create/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
    customer: getValidCustomerPrototype(),
    affiliates: getValidAffiliatesPrototype(),
    campaign: getValidCampaign().id
  };

}

function getValidCampaign(){

  return {
  	id:uuidV4(),
  	account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  	name: "Example Campaign",
  	allow_prepaid: false,
  	show_prepaid: false,
  	productschedules: getValidProductScheduleIDs(),
  	emailtemplates:["b44ce483-861c-4843-a7d6-b4c649d6bdde","8108d6a3-2d10-4013-9e8e-df71e2dc578b","102131a0-4cc4-4463-a614-e3157c3f03c2"],
  	affiliate_allow:["ad58ea78-504f-4a7e-ad45-128b6e76dc57"],
  	affiliate_deny:["*"],
  	created_at:timestamp.getISO8601(),
  	updated_at:timestamp.getISO8601()
  };

}

function getValidProductScheduleIDs(){

  return arrayutilities.map(getValidProductSchedules(), product_schedule => { return product_schedule.id; });

}

function getValidProductSchedules(){

  return [
    {
      id:uuidV4(),
      name:"Product Schedule 1",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      loadbalancer:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
      schedule:[
        {
          product_id:"616cc994-9480-4640-b26c-03810a679fe3",
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product_id:"be992cea-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product_id:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:28,
          period:28
        }
      ],
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    },
    {
      id:uuidV4(),
      name:"Product Schedule 2",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      loadbalancer:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
      schedule:[
        {
          product_id:"616cc994-9480-4640-b26c-03810a679fe3",
          price:4.99,
          start:17,
          end:23,
          period:33
        },
        {
          product_id:"be992cea-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:51,
          end:750,
          period:13
        },
        {
          product_id:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:908,
          period:31
        }
      ],
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    }
  ]
}

function getValidSession(){

  return {
    completed: false,
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: timestamp.getISO8601(),
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [],
    updated_at: timestamp.getISO8601(),
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: uuidV4(),
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidSessionPrototype(){

  let session = objectutilities.clone(getValidSession());

  delete session.id;
  delete session.account;
  delete session.product_schedules;
  delete session.created_at;
  delete session.updated_at;
  return session;

}

function getValidCustomerPrototype(){

  return {
		email:"rama@damunaste.org",
		firstname:"Rama",
		lastname:"Damunaste",
		phone:"1234567890",
		address:{
			"line1":"10 Downing St.",
			"city":"London",
			"state":"Oregon",
			"zip":"97213",
			"country":"US"
		}
	};

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

describe('createLead', function () {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      expect(objectutilities.getClassName(createLeadController)).to.equal('CreateLeadController');
    });
  });

  describe('execute', () => {

    before(() => {
      mockery.resetCache();
      mockery.deregisterAll();
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
      let customer = getValidCustomer();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:({id}) => {
          return Promise.resolve(session)
        },
        isEmail: (user_string) => {
          return true;
        },
        getUserStrict: (user_string) => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(null);
        },
        create:({entity}) => {
          return Promise.resolve(customer);
        }
      });

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(a_event){
          let cloned_event = objectutilities.clone(a_event);

          cloned_event.affiliates = affiliates;
          return Promise.resolve(cloned_event);
        }
        transcribeAffiliates(source_object, destination_object){
          return {};
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      let mock_tracker_helper_controller = class {
        constructor(){ }
        handleTracking(id, info){
          return Promise.resolve(info);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

      let mock_email_helper = class {
        constructor(){}
        sendEmail(a_event, info){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

      mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
        createNotificationsForAccount: (parameters) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        assureSession:(parameters) => {
          return Promise.resolve(session);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      return createLeadController.execute(event).then(result => {
        expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'entities/session.json'))).to.equal(true);
      });

    });

    it('successfully executes with local event', () => {

      let event = getLocalEvent();
      let customer = getValidCustomer();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:({id}) => {
          return Promise.resolve(session)
        },
        isEmail: (user_string) => {
          return true;
        },
        getUserStrict: (user_string) => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(null);
        },
        create:({entity}) => {
          return Promise.resolve(customer);
        }
      });

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(a_event){
          let cloned_event = objectutilities.clone(a_event);

          cloned_event.affiliates = affiliates;
          return Promise.resolve(cloned_event);
        }
        transcribeAffiliates(source_object, destination_object){
          return {};
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      let mock_tracker_helper_controller = class {
        constructor(){ }
        handleTracking(id, info){
          return Promise.resolve(info);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

      let mock_email_helper = class {
        constructor(){}
        sendEmail(a_event, info){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

      mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
        createNotificationsForAccount: (parameters) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        assureSession:(parameters) => {
          return Promise.resolve(session);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      return createLeadController.execute(event).then(result => {
        expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'entities/session.json'))).to.equal(true);
      });

    });

  });

  describe('assureCustomer', () => {

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

    it('successfully sets a new customer', () => {

      let event = getValidEventBody();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(customer);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);
      return createLeadController.assureCustomer().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
      });

    });

    it('successfully retrieves a existing customer', () => {

      let event = getValidEventBody();
      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(null);
        },
        create:({entity}) => {
          return Promise.resolve(customer);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);
      return createLeadController.assureCustomer().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
      });

    })
  });

  describe('assureAffiliates', () => {

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

    it('successfully assures affiliates', () => {

      let event = getValidEventBody();
      let affiliates = getValidAffiliates();

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(event){
          let cloned_event = objectutilities.clone(event);

          cloned_event.affiliates = affiliates;
          return Promise.resolve(cloned_event);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);
      return createLeadController.assureAffiliates().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['affiliates']).to.deep.equal(affiliates);
      });

    })
  });

  describe('setCampaign', () => {

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

    it('successfully sets the campaign', () => {

      let event = getValidEventBody();
      let campaign = getValidCampaign();

      event.campaign = campaign.id;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);
      return createLeadController.setCampaign().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['campaign']).to.deep.equal(campaign);
      });

    });

  });

  describe('assureLeadProperties', () => {

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

    it('successfully assures lead properties', () => {

      let event = getValidEventBody();
      let customer = getValidCustomer();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(null);
        },
        create:({entity}) => {
          return Promise.resolve(customer);
        }
      });

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(event){
          let cloned_event = objectutilities.clone(event);

          cloned_event.affiliates = affiliates;
          return Promise.resolve(cloned_event);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);

      return createLeadController.assureLeadProperties().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['campaign']).to.deep.equal(campaign);
        expect(createLeadController.parameters.store['affiliates']).to.deep.equal(affiliates);
        expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
      });

    });
  });

  describe('createSessionPrototype', () => {

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

    it('successfully creates a session prototype', () => {

      let customer = getValidCustomer();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session_prototype =  objectutilities.merge({
        customer: customer.id,
        campaign: campaign.id,
        completed: false
      }, affiliates);

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('customer', customer);
      createLeadController.parameters.set('campaign', campaign);
      createLeadController.parameters.set('affiliates', affiliates);

      return createLeadController.createSessionPrototype().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['session_prototype']).to.deep.equal(session_prototype);

      });
    });

  });

  describe('assureSession', () => {

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

    it('successfully assures the session', () => {

      let session_prototype = getValidSessionPrototype();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        assureSession:(parameters) => {
          return Promise.resolve(session);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session_prototype', session_prototype);
      return createLeadController.assureSession().then(result => {
        expect(result).to.equal(true);
        expect(createLeadController.parameters.store['session']).to.deep.equal(session);
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

    it('successfully triggers all post processing', () => {

      let session = getValidSession();
      let event = getValidEventBody();

      mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
        createNotificationsForAccount: (parameters) => {
          return Promise.resolve(true);
        }
      });

      let mock_email_helper = class {
        constructor(){}
        sendEmail(event, info){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'tracker-utilities.js'), {
        handleTracking:(id, info) => {
          return Promise.resolve(info);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      let mock_tracker_helper_controller = class {
        constructor(){ }
        handleTracking(id, info){
          return Promise.resolve(info);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session', session);
      createLeadController.parameters.set('event', event);

      return createLeadController.postProcessing().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('handleLeadNotifications', () => {

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

    it('successfully handles lead notifications', () => {

      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
        createNotificationsForAccount: (parameters) => {
          return Promise.resolve(true);
        }
      });

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session', session);

      return createLeadController.handleLeadNotifications().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('handleEmails', () => {

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

    it('successfully handles emails', () => {

      let session = getValidSession();

      let mock_email_helper = class {
        constructor(){}
        sendEmail(event, info){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session', session);

      return createLeadController.handleEmails().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('handleLeadTracking', () => {

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

    it('successfully handles lead tracking', () => {

      let event = getValidEventBody();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'tracker-utilities.js'), {
        handleTracking:(id, info) => {
          return Promise.resolve(info);
        }
      });

      let mock_tracker_helper_controller = class {
        constructor(){ }
        handleTracking(id, info){
          return Promise.resolve(info);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session', session);
      createLeadController.parameters.set('event', event);

      return createLeadController.handleLeadTracking().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('pushToRedshift', () => {

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

    it('successfully pushes lead to Redshift', () => {

      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('session', session);

      return createLeadController.pushToRedshift().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('createLead',  () => {

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

    it('successfully creates a lead', () => {

      let event = getValidEventBody();
      let customer = getValidCustomer();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getCustomerByEmail: (email) => {
          return Promise.resolve(null);
        },
        create:({entity}) => {
          return Promise.resolve(customer);
        }
      });

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(a_event){
          let cloned_event = objectutilities.clone(a_event);

          cloned_event.affiliates = affiliates;
          return Promise.resolve(cloned_event);
        }
        transcribeAffiliates(source_object, destination_object){
          return {};
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      let mock_tracker_helper_controller = class {
        constructor(){ }
        handleTracking(id, info){
          return Promise.resolve(info);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

      let mock_email_helper = class {
        constructor(){}
        sendEmail(a_event, info){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

      mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
        createNotificationsForAccount: (parameters) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        assureSession:(parameters) => {
          return Promise.resolve(session);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

      createLeadController.parameters.set('event', event);

      return createLeadController.createLead().then(result => {
        expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'entities/session.json'))).to.equal(true);
      });

    });

  });

});
