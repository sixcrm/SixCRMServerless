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
const random = global.SixCRM.routes.include('lib', 'random.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidResponseType(){
  return 'success';
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

function getValidInfo(){

  return {
    amount: 12.99,
    transactions: getValidTransactions(),
    product_schedules: getValidProductScheduleGroups(),
    customer: getValidCustomer(),
    rebill: getValidRebill(),
    session: getValidSession(),
    campaign: getValidCampaign(),
    creditcard: getValidCreditCard(),
    result:'success'
  };

}

function getValidTransactions(ids){
  return MockEntities.getValidTransactions(ids);
}

function getValidTransaction(id){
  return MockEntities.getValidTransaction(id);
}

function getValidRebill(id){
  return MockEntities.getValidRebill(id);
}

function getValidCustomer(id){
  return MockEntities.getValidCustomer(id);
}

function getValidProductScheduleIDs(){
  return arrayutilities.map(getValidProductSchedules(), product_schedule => { return product_schedule.id; });
}

function getValidProductSchedules(ids, expanded){
  return MockEntities.getValidProductSchedules(ids, expanded);
}

function getValidProductScheduleGroups(ids, expanded){
  return MockEntities.getValidProductScheduleGroups(ids, expanded);
}

function getValidTransactionProduct(ids){
  return MockEntities.getValidTransactionProducts(ids);
}

function getValidTransactionProducts(ids, extended){
  return MockEntities.getValidTransactionProducts(ids, extended);
}

function getValidProducts(ids){
  return MockEntities.getValidProducts(ids);
}

function getValidProductSchedule(){
  return getValidProductSchedules()[0];
}

function getValidSession(id){
  return MockEntities.getValidSession(id);
}

function getValidCampaign(id){
  return MockEntities.getValidCampaign(id)
}

function getValidCreditCard(id){
  return MockEntities.getValidCreditCard(id)
}

function getValidCreditCardPrototype(){

  return {
    number: "4111111111111111",
    expiration: "1025",
    ccv: "999",
    name: "Rama Damunaste",
    address: {
      "line1": "10 Skid Rw.",
      "line2": "Suite 100",
      "city": "Portland",
      "state": "OR",
      "zip": "97213",
      "country": "US"
    }
  };

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
      path: '/order/create/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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

function getValidEventBody(ids, expanded){

  return {
    session: getValidSession().id,
    product_schedules: getValidProductScheduleGroups(ids, expanded),
    creditcard: getValidCreditCardPrototype(),
    transaction_subtype:'main',
    products: [{
      quantity: randomutilities.randomInt(1, 10),
      price: randomutilities.randomDouble(1.00, 100.00, 2),
      product: MockEntities.getValidProduct()
    }]
  };

}

describe('createOrder', function () {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      expect(objectutilities.getClassName(createOrderController)).to.equal('CreateOrderController');
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

    it('successfully runs execute method', () => {

      let event = getValidEvent();
      let session = getValidSession();
      let campaign = getValidCampaign();

      session.completed = false;
      event.body = JSON.stringify(getValidEventBody(null, true));

      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';

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
          createRebill({session, product_schedules, products, day}){
              return Promise.resolve(rebill);
          }
      });

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

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      return createOrderController.execute(event).then(result => {
        let info = createOrderController.parameters.get('info');

        expect(mvu.validateModel(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
      });
    });

    it('successfully runs execute method in the absence of a event creditcard (upsell)', () => {

      let event = getValidEvent();

      delete event.creditcard;
      event.transaction_subtype = 'upsell';
      event.body = JSON.stringify(getValidEventBody(null, true));

      let session = getValidSession();
      let campaign = getValidCampaign();

      session.completed = false;

      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';

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
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
          constructor(){}
          createRebill({session, product_schedules, products, day}){
              return Promise.resolve(rebill);
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

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      return createOrderController.execute(event).then(result => {
        let info = createOrderController.parameters.get('info');

        expect(mvu.validateModel(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
      });
    });

  });

  describe('hydrateSession', () => {

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

    it('successfully gets event session property', () => {

      let session = getValidSession();
      let event = getValidEventBody();

      event.session = session.id;

      //du.info(event);  process.exit();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get: ({id}) => {
          return Promise.resolve(session)
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.hydrateSession().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['session']).to.deep.equal(session);
      });

    });

  });

  describe('hydrateEventAssociatedParameters', () => {

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

    it('successfully gets associated event properties', () => {

      let campaign = getValidCampaign();
      let event = getValidEventBody();
      let creditcard = getValidCreditCard();
      let customer = getValidCustomer();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
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

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        addCreditCard: (a_customer, a_creditcard) => {
          customer.creditcards.push(creditcard.id);
          return Promise.resolve(customer);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);
      createOrderController.parameters.set('session', session);

      return createOrderController.hydrateEventAssociatedParameters().then((result) => {

        expect(result).to.equal(true);

        let hydrated_campaign = createOrderController.parameters.store['campaign'];

        let stored_credit_card = createOrderController.parameters.store['creditcard'];

        delete stored_credit_card.id;
        delete stored_credit_card.created_at;
        delete stored_credit_card.updated_at;
        delete stored_credit_card.account;
        expect(stored_credit_card).to.deep.equal(event.creditcard)

        expect(hydrated_campaign).to.deep.equal(campaign);

        expect(createOrderController.parameters.store['productschedules']).to.deep.equal(event.product_schedules);

        expect(createOrderController.parameters.store['transactionsubtype']).to.deep.equal(event.transaction_subtype);

      });

    });

  });

  describe('validateEventProperties', () => {

    it('successfully validates event properties', () => {

      let session = getValidSession();

      session.completed = false;

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('sessionlength', 3600);

      return createOrderController.validateEventProperties().then(result => {
        expect(result).to.equal(true);
      });

    });

    it('throws an error if the session is closed', () => {

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      let session = getValidSession();

      session.completed = true;

      createOrderController.parameters.set('session', session);

      try {
        createOrderController.validateEventProperties()
      }catch(error){
        expect(error.message).to.equal('[400] The session is already complete.');
      }

    });

    it('throws an error if the session is expired', () => {

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      let session = getValidSession();

      session.completed = false;
      session.created_at = timestamp.toISO8601((timestamp.createTimestampSeconds() - 3610));

      createOrderController.parameters.set('session', session);

      try {
        createOrderController.validateEventProperties();
      } catch (error) {
        expect(error.message).to.equal('[400] Session has expired.');
      }

    });

  });

  describe('addCreditCardToCustomer', () => {

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

    it('successfully adds the credit card to the customer', () => {

      let customer = getValidCustomer();
      let session = getValidSession();
      let creditcard = getValidCreditCard();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        addCreditCard: (a_customer, a_creditcard) => {
          customer.creditcards.push(creditcard.id);
          return Promise.resolve(customer);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('creditcard', creditcard);

      return createOrderController.addCreditCardToCustomer().then(result => {
        expect(result).to.equal(true);
        let updated_customer = createOrderController.parameters.store['customer'];

        expect(updated_customer).to.deep.equal(customer);
      });

    });
  });

  describe('createRebill', () => {

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

    it('successfully creates the order rebill', () => {

      let session = getValidSession();
      let product_schedules = getValidProductScheduleGroups();
      let transaction_products = getValidTransactionProducts(null, true);

      let rebill = getValidRebill();

      rebill.products = transaction_products;
      rebill.product_schedules = arrayutilities.map(getValidProductScheduleGroups(), product_schedule_group => product_schedule_group.product_schedule);

      let mock_rebill_creator_helper = class {

        constructor(){

        }

        createRebill({session, product_schedules, products, day}){
          return Promise.resolve(rebill);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), mock_rebill_creator_helper);

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);
      createOrderController.parameters.set('products', transaction_products);

      return createOrderController.createRebill().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['rebill']).to.deep.equal(rebill);
      });

    });

  });

  describe('processRebill', () => {

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

    it('successfully processes a rebill', () => {

      let rebill = getValidRebill();
      let processor_response = getValidProcessorResponse();
      let response_type = getValidResponseType();
      let creditcard = getValidCreditCard();
      let transactions = getValidTransactions();

      const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
      let register_response = new RegisterResponse({
        transactions: transactions,
        processor_response: processor_response,
        response_type: response_type,
        creditcard: creditcard
      });

      let mock_register = class {

        constructor(){

        }

        processTransaction({rebill: rebill}){
          return Promise.resolve(register_response);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), mock_register);

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);

      return createOrderController.processRebill().then(result => {
        expect(result).to.equal(true);
        let transaction = createOrderController.parameters.store['transaction'];

        expect(transaction).to.deep.equal(register_response.parameters.store['transaction']);


      });

    });

  });

  xdescribe('updateEntities', () => {

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

    it('successfully updates entities associted with the the transaction', () => {

      let transaction = getValidTransaction();
      let rebill = getValidRebill();
      let session = getValidSession();
      let product_schedule_groups = getValidProductScheduleGroups();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);
      createOrderController.parameters.set('transaction', transaction);
      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedule_groups);

      session.product_schedules = arrayutilities.merge(session.product_schedules, arrayutilities.map(product_schedule_groups, product_schedule_group => product_schedule_group.product_schedule.id));

      return createOrderController.updateEntities().then(result => {
        expect(result).to.equal(true);
        let updated_session = createOrderController.parameters.store['session'];
        let updated_rebill = createOrderController.parameters.store['rebill'];

        expect(updated_rebill).to.deep.equal(rebill);
        expect(updated_session).to.deep.equal(session);
      });

    });

    xit('updates entities associated with a transaction when session doesn\'t contain product schedules', () => {

      let transaction = getValidTransaction();
      let rebill = getValidRebill();
      let session = getValidSession();
      let product_schedules = getValidProductScheduleIDs();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      delete session.product_schedules;
      createOrderController.parameters.set('rebill', rebill);
      createOrderController.parameters.set('transaction', transaction);
      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);

      return createOrderController.updateEntities().then(result => {
        expect(result).to.equal(true);
        let updated_session = createOrderController.parameters.store['session'];
        let updated_rebill = createOrderController.parameters.store['rebill'];

        expect(updated_rebill).to.deep.equal(rebill);
        expect(updated_session).to.deep.equal(session);
      });

    });

    xit('updates entities associated with a transaction when rebill doesn\'t contain transactions', () => {

      let transaction = getValidTransaction();
      let rebill = getValidRebill();
      let session = getValidSession();
      let product_schedules = getValidProductScheduleIDs();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);
      createOrderController.parameters.set('transaction', transaction);
      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);

      session.product_schedules = arrayutilities.merge(session.product_schedules, product_schedules);

      return createOrderController.updateEntities().then(result => {
        expect(result).to.equal(true);
        let updated_session = createOrderController.parameters.store['session'];
        let updated_rebill = createOrderController.parameters.store['rebill'];

        expect(updated_rebill).to.deep.equal(rebill);
        expect(updated_session).to.deep.equal(session);
      });

    });

  });

  describe('buildInfoObject', () => {

    it('successfully builds and sets the info object', () => {

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('amount', 12.99);
      createOrderController.parameters.set('rebill', getValidRebill());
      createOrderController.parameters.set('transactions', getValidTransactions());
      createOrderController.parameters.set('session', getValidSession());
      createOrderController.parameters.set('productschedules', getValidProductScheduleGroups());
      createOrderController.parameters.set('customer', getValidCustomer());
      createOrderController.parameters.set('rebill', getValidRebill());
      createOrderController.parameters.set('campaign', getValidCampaign());
      createOrderController.parameters.set('creditcard', getValidCreditCard());
      createOrderController.parameters.set('result', 'success');

      return createOrderController.buildInfoObject().then(result => {
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

    beforeEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    it('successfully executes post processing methods', () => {

      let rebill = getValidRebill();
      let session = getValidSession();
      let product_schedules = getValidProductScheduleGroups(null, true);
      let product_groups = getValidTransactionProducts(null, true);
      let info = getValidInfo();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
        constructor(){}
        addRebillToQueue({rebill, queue_name}){
          return Promise.resolve(true);
        }
        updateRebillState({rebill, state}){
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        update({entity}){
          return Promise.resolve(entity);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);
      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);
      createOrderController.parameters.set('products', product_groups);
      createOrderController.parameters.set('info', info);
      createOrderController.parameters.set('result', 'success');

      return createOrderController.postProcessing().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('addRebillToQueue', () => {

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

    it('successfully adds the rebill to the appropriate queue', () => {

      let rebill = getValidRebill();

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

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);

      return createOrderController.addRebillToQueue().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('pushEventsRecord', () => {

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

    it('successfully pushes a event record', () => {

      let session = getValidSession();
      let product_schedules = getValidProductScheduleGroups();
      let products = getValidProducts();
      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);
      createOrderController.parameters.set('products', products);
      createOrderController.parameters.set('rebill', rebill);

      return createOrderController.pushEventsRecord().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('setProductSchedules', () => {

    it('successfully sets product schedules', () => {

      let event = getValidEventBody();

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.setProductSchedules().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['productschedules']).to.equal(event.product_schedules);
      });

    });

  });

  describe('setTransactionSubType', () => {

    it('successfully sets the transaction subtype', () => {

      let event = getValidEventBody();

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.setTransactionSubType().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['transactionsubtype']).to.equal(event.transaction_subtype);
      });

    });

    it('returns "main" when event doesn\'t have a transaction subtype', () => {

      let event = getValidEventBody();

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      delete event.transaction_subtype;
      createOrderController.parameters.set('event', event);

      return createOrderController.setTransactionSubType().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['transactionsubtype']).to.equal('main');
      });

    });
  });

  describe('setCreditCard', () => {

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

    it('successfully sets a creditcard', () => {

      let event = getValidEventBody();
      let customer = getValidCustomer();
      let session = getValidSession();


      mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), {
        assureCreditCard: (creditcard) => {
          return Promise.resolve(objectutilities.merge(creditcard, {
            id: uuidV4(),
            created_at: timestamp.getISO8601(),
            updated_at: timestamp.getISO8601(),
            account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
          }));
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        addCreditCard: (a_customer, a_creditcard) => {
          customer.creditcards.push(a_creditcard.id);
          return Promise.resolve(customer);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);
      createOrderController.parameters.set('session', session);

      return createOrderController.setCreditCard().then(result => {
        expect(result).to.equal(true);
        let set_creditcard = createOrderController.parameters.store['creditcard'];

        delete set_creditcard.id;
        delete set_creditcard.created_at;
        delete set_creditcard.updated_at;
        delete set_creditcard.account;
        expect(set_creditcard).to.deep.equal(event.creditcard);
      })

    });

    it('successfully skips when creditcard is not set', () => {

      let event = getValidEventBody();

      delete event.creditcard;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), {
        assureCreditCard: (creditcard) => {
          throw new Error();
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.setCreditCard().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['creditcard']).to.be.undefined;
      });

    });
  });

  describe('setCampaign', () => {

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

    it('successfully sets the campaign', () => {

      let campaign = getValidCampaign();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', getValidSession());

      return createOrderController.setCampaign().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['campaign']).to.deep.equal(campaign);
      });

    });

  });

  describe('setCustomer', () => {

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

    it('successfully sets a customer', () => {

      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        get:({id}) => {
          return Promise.resolve(customer);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', getValidSession());

      return createOrderController.setCustomer().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['customer']).to.deep.equal(customer);
      });

    });

    it('successfully skips method when the customer is already set', () => {

      let customer = getValidCustomer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        get:({id}) => {
          throw new Error();
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', getValidSession());
      createOrderController.parameters.set('customer', customer);

      return createOrderController.setCustomer().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['customer']).to.deep.equal(customer);
      });

    });
  });

  describe('createOrder', () => {

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

    it('successfully creates a order', () => {

      let event = getValidEventBody(null, true);
      let product_schedule_ids = arrayutilities.map(event.product_schedules, product_schedule_group => product_schedule_group.product_schedule);
      let product_schedules = getValidProductSchedules(product_schedule_ids, true);
      let session = getValidSession();

      session.completed = false;

      let campaign = getValidCampaign();
      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';

      //const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
      //let productScheduleHelper = new ProductScheduleHelperController();

      mockery.registerMock(global.SixCRM.routes.path('helpers','entities/productschedule/ProductSchedule.js'), class {
        constructor(){}
        getHydrated({id}){
          return Promise.resolve(arrayutilities.find(product_schedules, product_schedule => { return product_schedule.id == id }));
        }
        getNextScheduleElementStartDayNumber({product_schedule, day}){
          return 0;
        }
        getScheduleElementOnDayInSchedule({product_schedule, day}){
          return 0;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
        constructor(){}
        createRebill({session, product_schedules, products, day}){
          return Promise.resolve(rebill);
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

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
        constructor(){}
        addRebillToQueue({rebill, queue_name}){
          return Promise.resolve(true);
        }
        updateRebillState({rebill, state}){
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
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
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.createOrder().then(result => {

        let info = createOrderController.parameters.get('info');

        expect(mvu.validateModel(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);

      });

    });

  });

});
