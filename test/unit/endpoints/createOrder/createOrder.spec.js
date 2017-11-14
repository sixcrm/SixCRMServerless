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
    transaction: getValidTransaction(),
    product_schedules: getValidProductScheduleIDs(),
    customer: getValidCustomer(),
    rebill: getValidRebill(),
    session: getValidSession(),
    campaign: getValidCampaign(),
    creditcard: getValidCreditCard(),
    result:'success'
  };

}

function getValidTransaction(){
  return {
    amount: 34.99,
    id: uuidV4(),
    alias:"T56S2HJO32",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    rebill: uuidV4(),
    processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    merchant_provider: uuidV4(),
    products:[{
      product:uuidV4(),
      amount:34.99
    }],
    type:"sale",
    result:"success",
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
  };
}

function getValidRebill(){
  return {
    parentsession: uuidV4(),
    bill_at: timestamp.getISO8601(),
    amount: 12.22,
    product_schedules:[],
    products:[
      {
        product: uuidV4(),
        amount: 3.22
      },
      {
        product: uuidV4(),
        amount: 9
      }
    ],
    id: uuidV4(),
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    transactions:[],
    created_at: timestamp.getISO8601(),
    updated_at: timestamp.getISO8601()
  };
}

function getValidCustomer(){

  return {
		id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
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
		},
		creditcards:[uuidV4()],
		created_at:timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
	}

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

function getValidProductSchedule(){

  return getValidProductSchedules()[0];

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

function getValidCreditCard(){

  return objectutilities.merge(getValidCreditCardPrototype(), {
    id: uuidV4(),
    account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
    created_at:timestamp.getISO8601(),
  	updated_at:timestamp.getISO8601()
  });

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
      "state": "Oregon",
      "zip": "97213",
      "country": "USA"
    }
  };

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
    session: getValidSession().id,
    product_schedules: getValidProductScheduleIDs(),
    creditcard: getValidCreditCardPrototype()
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

      campaign.productschedules = arrayutilities.merge(campaign.productschedules, JSON.parse(event.body).product_schedules);
      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let rebill = getValidRebill();
      let transaction = getValidTransaction();
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
        },
        addRebillToQueue:(rebill, queue_name) => {
          return Promise.resolve(true);
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

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      let mock_register = class {

        constructor(){

        }

        processTransaction({rebill: rebill}){
          const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
          let register_response = new RegisterResponse({transaction: transaction, processor_response: processor_response, response_type: response_type});

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

  describe('hydrateEventParameters', () => {

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

    it('successfully gets event properties', () => {

      let session = getValidSession();
      let event = getValidEventBody();

      event.session = session.id;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        get: ({id}) => {
          return Promise.resolve(session)
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

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('event', event);

      return createOrderController.hydrateEventParameters().then(result => {
        expect(result).to.equal(true);
        expect(createOrderController.parameters.store['session']).to.deep.equal(session);
        let stored_credit_card = createOrderController.parameters.store['creditcard'];

        delete stored_credit_card.id;
        delete stored_credit_card.created_at;
        delete stored_credit_card.updated_at;
        delete stored_credit_card.account;
        expect(stored_credit_card).to.deep.equal(event.creditcard)
        expect(createOrderController.parameters.store['productschedules']).to.deep.equal(event.product_schedules);
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

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), {
        get: ({id}) => {
          return Promise.resolve(campaign)
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', getValidSession());

      return createOrderController.hydrateEventAssociatedParameters().then((result) => {
        expect(result).to.equal(true);
        let hydrated_campaign = createOrderController.parameters.store['campaign'];

        expect(hydrated_campaign).to.deep.equal(campaign);

      });

    });

  });

  describe('validateEventProperties', () => {

    it('successfully validates event properties', () => {

      let session = getValidSession();
      let campaign = getValidCampaign();
      let product_schedule_ids = getValidProductScheduleIDs()

      campaign.productschedules = arrayutilities.merge(campaign.productschedules, product_schedule_ids);

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('campaign', campaign);
      createOrderController.parameters.set('productschedules', product_schedule_ids);

      return createOrderController.validateEventProperties().then(result => {
        expect(result).to.equal(true);
      });

    });

    it('throws an error if the session is closed', () => {

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      let session = getValidSession();
      let campaign = getValidCampaign();
      let product_schedule_ids = getValidProductScheduleIDs()

      campaign.productschedules = arrayutilities.merge(campaign.productschedules, product_schedule_ids);

      session.completed = true;

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('campaign', campaign);
      createOrderController.parameters.set('productschedules', product_schedule_ids);

      try {
        createOrderController.validateEventProperties()
      }catch(error){
        expect(error.message).to.equal('[400] The session is already complete.');
      }

    });

    it('throws an error if the session is expired', () => {

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      let session = getValidSession();
      let campaign = getValidCampaign();
      let product_schedule_ids = getValidProductScheduleIDs();

      campaign.productschedules = arrayutilities.merge(campaign.productschedules, product_schedule_ids);

      session.created_at = timestamp.toISO8601((timestamp.createTimestampSeconds() - 3601));

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('campaign', campaign);
      createOrderController.parameters.set('productschedules', product_schedule_ids);

      try {
        createOrderController.validateEventProperties();
      } catch (error) {
        expect(error.message).to.equal('[400] Session has expired.');
      }

    });

  });

  describe('updateCustomer', () => {

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

    it('successfully updates the customer', () => {

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

      return createOrderController.updateCustomer().then(result => {
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
      let product_schedules = getValidProductSchedules();
      let rebill = getValidRebill();
      let product_schedule_ids = arrayutilities.map(product_schedules, product_schedule => { return product_schedule.id; });

      let mock_rebill_helper = class {

        constructor(){

        }

        createRebill({session, product_schedules, day}){
          rebill.product_schedules = product_schedules;
          rebill.parentsession = session.id
          return Promise.resolve(rebill);
        }

      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedule_ids);

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
      let transaction = getValidTransaction();
      let processor_response = getValidProcessorResponse();
      let response_type = getValidResponseType();

      const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
      let register_response = new RegisterResponse({transaction: transaction, processor_response: processor_response, response_type: response_type});

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

  describe('updateEntities', () => {

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
      rebill.transactions = arrayutilities.merge(rebill.transactions, [transaction.id]);

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

      createOrderController.parameters.set('rebill', getValidRebill());
      createOrderController.parameters.set('transaction', getValidTransaction());
      createOrderController.parameters.set('session', getValidSession());
      createOrderController.parameters.set('productschedules', getValidProductScheduleIDs());
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
      let product_schedules = getValidProductScheduleIDs();
      let info = getValidInfo();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        addRebillToQueue:(rebill, queue_name) => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('rebill', rebill);
      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);
      createOrderController.parameters.set('info', info);

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

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        addRebillToQueue:(rebill, queue_name) => {
          return Promise.resolve(true);
        }
      });

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
      let product_schedules = getValidProductScheduleIDs();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('session', session);
      createOrderController.parameters.set('productschedules', product_schedules);

      return createOrderController.pushEventsRecord().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('pushTransactionsRecord', () => {

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

    it('successfully pushes a transaction record', () => {

      let info = getValidInfo();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          return Promise.resolve(true);
        }
      });

      let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

      createOrderController.parameters.set('info', info);

      return createOrderController.pushTransactionsRecord().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

});
