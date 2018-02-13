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
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCustomer(){
  return MockEntities.getValidCustomer();
}

function getLocalEvent(){
  return JSON.stringify(getValidEvent());
}

function getValidEvent(){

  return {
    resource: '/checkout/{account}',
    path: '/checkout/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
      path: '/checkout/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
      resourcePath: '/checkout/{account}',
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
    campaign: getValidCampaign().id,
    product_schedules: arrayutilities.map(MockEntities.getValidProductSchedules(), product_schedule => {
      return {quantity: 1, product_schedule: product_schedule.id};
    }),
    creditcard: getValidCreditCardPrototype()
  };

}

function getValidCampaign(){
  return MockEntities.getValidCampaign();
}

function getValidCreditCard(){
  return MockEntities.getValidCreditCard();
}

function getValidCreditCardPrototype(){

  let creditcard = MockEntities.getValidCreditCard();

  delete creditcard.id;
  delete creditcard.created_at;
  delete creditcard.updated_at;
  delete creditcard.account;
  return creditcard;

}

function getValidProductScheduleIDs(){
  return arrayutilities.map(getValidProductSchedules(), product_schedule => { return product_schedule.id; });
}

function getValidProductSchedules(){
  return MockEntities.getValidProductSchedules();
}

function getValidProductSchedule(id, expanded){
  return MockEntities.getValidProductSchedule(id, expanded);
}

function getValidSession(){
  return MockEntities.getValidSession();
}

function getValidSessionPrototype(){

  let session = MockEntities.getValidSession();

  delete session.id;
  delete session.account;
  delete session.product_schedules;
  delete session.created_at;
  delete session.updated_at;
  return session;

}

function getValidCustomerPrototype(){

  let customer = MockEntities.getValidCustomer();

  delete customer.id;
  delete customer.created_at;
  delete customer.updated_at;
  delete customer.account;
  return customer;

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

function getValidRebill(){
  return MockEntities.getValidRebill();
}

function getValidTransactions(){
  return MockEntities.getValidTransactions();
}

function getValidTransaction(){
  return MockEntities.getValidTransactions();
}

function getValidTransactionProducts(ids, expanded){
  return MockEntities.getValidTransactionProducts(ids, expanded);
}

function getValidProcessorResponse(){

  return {
    code: 'success',
    result: {
      message: "Success",
      result:{
        response:"1",
        responsetext:"SUCCESS",
        authcode:"123456",
        transactionid:"3448894418",
        avsresponse:"N",
        cvvresponse:"",
        orderid:"",
        type:"sale",
        response_code:"100"
      }
    },
    message: 'Some message'
  };

}

function getValidConfirmation(){

  return {
    transactions: MockEntities.getValidTransactions(),
    session: getValidSession(),
    customer: getValidCustomer(),
    transaction_products: MockEntities.getValidTransactionProducts(null, true)
  };

}


describe('checkout', function () {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      expect(objectutilities.getClassName(checkoutController)).to.equal('checkoutController');

    });

  });

  describe('createLead', () => {

    it('successfully creates a lead', () => {

      let event_body = getValidEventBody();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session = getValidSession();
      let customer = getValidCustomer();

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

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      checkoutController.parameters.set('event', event_body);

      return checkoutController.createLead().then(result => {
        expect(result).to.equal(true);
        expect(checkoutController.parameters.store['session']).to.deep.equal(session);
      });

    });

  });

  xdescribe('createOrder', () => {

    it('successfully creates a order', () => {

      let event = getValidEventBody();
      let session = getValidSession();

      session.completed = false;
      let campaign = getValidCampaign();
      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let product_schedule = getValidProductSchedule(null, true);

      event.session = session.id;
      customer.creditcards = [creditcard.id];

      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
        getHydrated({id}){
          return Promise.resolve(product_schedule);
        }
        getNextScheduleElementStartDayNumber(){
          return 0;
        }
        getScheduleElementOnDayInSchedule({product_schedule, day}){
          return product_schedule[0];
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        },
        get:({id}) => {
          return Promise.resolve(session)
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        },
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), {
        assureCreditCard:() => {
          return Promise.resolve(creditcard);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        addCreditCard: (a_customer, a_creditcard) => {
          customer.creditcards.push(creditcard.id);
          return Promise.resolve(customer);
        },
        get:({id}) => {
          return Promise.resolve(customer);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill(){
          return Promise.resolve(rebill);
        }
      });

      let mock_rebill_helper = class {

        constructor(){

        }

        calculateAmount(){
          return randomutilities.randomDouble(1.00, 100.00);
        }

        addRebillToQueue({rebill, queue_name}){
          return Promise.resolve(true);
        }

        updateRebillState({rebill, state}){
          return Promise.resolve(true);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      let mock_register = class {

        constructor(){

        }

        processTransaction({rebill: rebill}){
          const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
          let register_response = new RegisterResponse({
            transactions: transactions,
            processor_response: processor_response,
            response_type: response_type,
            creditcard: creditcard
          });

          return Promise.resolve(register_response);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), mock_register);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      checkoutController.parameters.set('event', event);

      return checkoutController.createOrder().then(result => {
        expect(result).to.equal(true);
        expect(checkoutController.parameters.store['order']).to.be.defined;
      });

    });

  });

  describe('confirmOrder', () => {

    it('successfully confirms a order', () => {

      let event = getValidEventBody();
      let session = getValidSession();

      session.completed = false;
      event.session = session.id;

      let transactions = getValidTransactions();
      let products = getValidTransactionProducts(null, true);
      let customer = getValidCustomer();

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get:({id}) => {
          return Promise.resolve(session);
        },
        getCustomer:(session) => {
          return Promise.resolve(customer);
        },
        listTransactions:(session) => {
          return Promise.resolve(transactions);
        },
        closeSession:(session) => {
          return Promise.resolve(true);
        }
      });

      let mock_transaction_helper_controller = class {
        constructor(){}
        getTransactionProducts(transactions){
          return products;
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      checkoutController.parameters.set('event', event);

      return checkoutController.confirmOrder().then(result => {
        expect(result).to.equal(true);
        expect(checkoutController.parameters.store['confirmation']).to.be.defined;
      });

    });

  });

  describe('setSession', () => {

    it('successfully sets the session property in the event', () => {

      let event_body = getValidEventBody();
      let session = getValidSession();

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      checkoutController.parameters.set('event', event_body);
      checkoutController.parameters.set('session', session);

      return checkoutController.setSession().then(result => {
        expect(result).to.equal(true);
        expect(checkoutController.parameters.store['event'].session).to.equal(session.id);
      });

    });

  });

  describe('postProcessing', () => {

    it('successfully executes all post processing functions', () => {

      let confirmation = getValidConfirmation();

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      checkoutController.parameters.set('confirmation', confirmation);

      let result = checkoutController.postProcessing();

      expect(result).to.deep.equal(confirmation);

    });

  });

  describe('execute', () => {

    xit('successfully executes a checkout event', () => {

      let event = getValidEvent();
      let affiliates = getValidAffiliates();
      let campaign = getValidCampaign();
      let session = getValidSession();

      session.completed = false;
      let customer = getValidCustomer();

      customer.creditcards = [];

      let creditcard = getValidCreditCard();
      let rebill = getValidRebill();
      let transaction = getValidTransaction();
      let transactions = [transaction];
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';
      let product_schedules = getValidProductSchedules(null, true);

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
        getHydrated({id}){
          return Promise.resolve(product_schedules);
        }
      });

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
        addCreditCard: (a_customer, a_creditcard) => {
          customer.creditcards.push(creditcard.id);
          return Promise.resolve(customer);
        },
        get:({id}) => {
          return Promise.resolve(customer);
        },
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
        },
        update:({entity}) => {
          return Promise.resolve(entity);
        },
        get:({id}) => {
          return Promise.resolve(session)
        },
        getCustomer:(session) => {
          return Promise.resolve(customer);
        },
        listTransactions:(session) => {
          return Promise.resolve(transactions);
        },
        closeSession:(session) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), {
        assureCreditCard: (creditcard) => {
          return Promise.resolve(objectutilities.merge(creditcard, {
            id: uuidV4(),
            created_at: timestamp.getISO8601(),
            updated_at: timestamp.getISO8601(),
            account: global.account
          }));
        }
      });

      let mock_register = class {

        constructor(){

        }

        processTransaction({rebill: rebill}){
          const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
          let register_response = new RegisterResponse({
            transaction: transaction,
            processor_response: processor_response,
            response_type: response_type,
            creditcard: creditcard
          });

          return Promise.resolve(register_response);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), mock_register);

      let mock_rebill_helper = class {

        constructor(){

        }

        createRebill({session, product_schedules, day}){
          rebill.product_schedules = product_schedules;
          rebill.parentsession = session.id
          return Promise.resolve(rebill);
        }

        addRebillToQueue({rebill, queue_name}){
          return Promise.resolve(true);
        }

        updateRebillState({rebill, state}){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

      return checkoutController.execute(event).then(result => {
        expect(checkoutController.parameters.store['confirmation']).to.be.defined;
      });

    });

  });

});
