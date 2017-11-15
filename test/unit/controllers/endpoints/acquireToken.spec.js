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

function getValidUpdatedEvent(){

  let updated_event = objectutilities.clone(getValidEventBody());

  updated_event = objectutilities.merge(updated_event, getValidAffiliates());
  delete updated_event.affiliates;

  return updated_event;

}

function getValidJWT(){
  return  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
}

function getValidEvent(){

  return {
  	"requestContext":"{\"authorizer\":{\"user\":\"4ee23a8f5c8661612075a89e72a56a3c6d00df90\"}}",
  	"pathParameters": "{ \"account\": \"d3fa3bf3-7824-49f4-8261-87674482bf1c\" }",
  	"Authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0ODM4MzkyMjR9.jW6hbpILFKRJq1bRN_7XaH1ZrqCT_QK8t4udTrLAgts",
  	"body":JSON.stringify(getValidEventBody())
  };

}

function getValidEventBody(){

  return {
    campaign: getValidCampaign().id,
    affiliates: getValidAffiliatesPrototype()
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
        get:({id}) => {
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
        getJWT: (user_object, type) => {
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

  describe('updateEventObjectWithAffiliateInformation', () => {

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

      let affiliates_helper_mock = class {
        constructor(){}
        handleAffiliateInformation(event){
          return Promise.resolve(almost_updated_event);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.parameters.set('event', event);
      return acquireTokenController.updateEventObjectWithAffiliateInformation().then(result => {
        expect(result).to.equal(true);
        expect(acquireTokenController.parameters.store['updatedevent']).to.deep.equal(almost_updated_event);
      });

    });

  });

  describe('createEventPrototype', () => {

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

    it('successfully creates a event prototype', () => {

      let event = getValidEventBody();
      let affiliates = getValidAffiliates();
      let updated_event = getValidUpdatedEvent();
      let event_prototype = getValidEventPrototype();

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.createEventObject = () => { return event_prototype; }
      acquireTokenController.parameters.set('updatedevent', updated_event);

      return acquireTokenController.createEventPrototype().then(result => {
        expect(result).to.equal(true);
        expect(acquireTokenController.parameters.store['redshifteventobject']).to.deep.equal(event_prototype);
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

    it('successfully pushes the event prototype to redshift', () => {

      let redshifteventobject = getValidEventPrototype();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');

      acquireTokenController.parameters.set('redshifteventobject', redshifteventobject);

      return acquireTokenController.pushToRedshift().then(result => {
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

      let affiliates_helper_mock = class {
        constructor(){
          this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];
        }
        handleAffiliateInformation(a_event){
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
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let acquireTokenController = global.SixCRM.routes.include('controllers', 'endpoints/acquireToken.js');
      //acquireTokenController.createEventObject = () => { return redshifteventobject; }

      acquireTokenController.parameters.set('event', event);

      return acquireTokenController.postProcessing().then(result => {
        expect(result).to.equal(true);
      });

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
        getJWT: (user_object, type) => {
          return jwt;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get:({id}) => {
          return Promise.resolve(campaign);
        }
      });

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

      let affiliates_helper_mock = class {
        constructor(){
          this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];
        }
        handleAffiliateInformation(a_event){
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
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
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
