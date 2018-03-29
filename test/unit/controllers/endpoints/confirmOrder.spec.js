'use strict'
const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;
const uuidV4 = require('uuid/v4');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidCampaign(){
  return MockEntities.getValidCampaign();
}

function getValidCustomer(){

  return MockEntities.getValidCustomer();

}

function getValidTransactionProducts(ids, expanded){
  return MockEntities.getValidTransactionProducts(ids, expanded);
}


function getValidTransactions(){
  return MockEntities.getValidTransactions();
}

function getValidEvent(){

  return {
    resource: '/order/confirm/{account}',
    path: '/order/confirm/d3fa3bf3-7824-49f4-8261-87674482bf1c',
    httpMethod: 'GET',
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
    queryStringParameters: {
      session: '668ad918-0d09-4116-a6fe-0e8a9eda36f7'
    },
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
      resourcePath: '/order/confirm/{account}',
      httpMethod: 'GET',
      apiId: '8jmwnwcaic'
    },
    body: null,
    isBase64Encoded: false
  };

}

function getValidEventBody(){

  return {
    session: uuidV4()
  };

}

function getValidSession(){
  return MockEntities.getValidSession();
}

describe('confirmOrder', function () {

  describe('constructor', () => {
    it('successfully constructs', () => {
      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      expect(objectutilities.getClassName(confirmOrderController)).to.equal('ConfirmOrderController');
    });
  });

  describe('hydrateSession', () => {

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

    it('successfully hydrates a session', () => {

      let event = getValidEventBody();
      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        get() {
          return Promise.resolve(session);
        }
      });

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('event', event);

      return confirmOrderController.hydrateSession().then(result => {
        expect(result).to.equal(true);
        expect(confirmOrderController.parameters.store['session']).to.deep.equal(session);
      });

    });

  });

  describe('validateSession', () => {

    it('successfully validates a session', () => {

      let session = getValidSession();

      session.completed = false;

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);

      return confirmOrderController.validateSession().then(result => {
        expect(result).to.equal(true);
      });

    });

    it('successfully throws an error when a session does not validate', () => {

      let session = getValidSession();

      session.completed = true;

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);

      try{
        confirmOrderController.validateSession();
      }catch(error){
        expect(error.message).to.equal('[400] The specified session is already complete.');
      }

    });
  });

  describe('hydrateSessionProperties', () => {

    before(() => {
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

    it('successfully hydrates session properties', () => {

      let session = getValidSession();
      let customer = getValidCustomer();
      let transactions = getValidTransactions();
      let products = getValidTransactionProducts(null, true);
      let campaign = getValidCampaign();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        getCustomer() {
          return Promise.resolve(customer);
        }
        listTransactions() {
          return Promise.resolve(transactions);
        }
        getCampaign() {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), class {
        constructor(){}
        getTransactionProducts(){
          return products;
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);

      return confirmOrderController.hydrateSessionProperties().then(result => {
        expect(result).to.equal(true);
        expect(confirmOrderController.parameters.store['customer']).to.deep.equal(customer);
        expect(confirmOrderController.parameters.store['transactions']).to.deep.equal(transactions);
        expect(confirmOrderController.parameters.store['transactionproducts']).to.deep.equal(products);
      });

    });

  });

  describe('closeSession', () => {

    before(() => {
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

    it('successfully closes a session', () => {

      let session = getValidSession();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        closeSession() {
          return Promise.resolve(true);
        }
      });

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);

      return confirmOrderController.closeSession().then(result => {
        expect(result).to.equal(true);
      });

    });

  });

  describe('buildResponse', () => {

    before(() => {
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

    it('successfully builds a response', () => {

      let session = getValidSession();
      let transactions = getValidTransactions();
      let products = getValidTransactionProducts(null, true);
      let customer = getValidCustomer();

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);
      confirmOrderController.parameters.set('transactions', transactions);
      confirmOrderController.parameters.set('transactionproducts', products);
      confirmOrderController.parameters.set('customer', customer);

      return confirmOrderController.buildResponse().then(result => {
        expect(result).to.equal(true);
        expect(confirmOrderController.parameters.store['response'].session).to.deep.equal(session);
        expect(confirmOrderController.parameters.store['response'].transactions).to.deep.equal(transactions);
        expect(confirmOrderController.parameters.store['response'].transaction_products).to.deep.equal(products);
        expect(confirmOrderController.parameters.store['response'].customer).to.deep.equal(customer);
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

    it('successfully executes post processing', () => {

        mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities.js'), {
            publish: () => {
                return Promise.resolve();
            },
            getRegion: () => 'localhost'
        });

      let session = getValidSession();

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('session', session);

      let result = confirmOrderController.postProcessing();

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
      let session = getValidSession();
      let transactions = getValidTransactions();
      let products = getValidTransactionProducts(null, true);
      let customer = getValidCustomer();
      let campaign = getValidCampaign();

      session.completed = false;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:() => {
          return Promise.resolve(session)
        },
        isEmail: () => {
          return true;
        },
        getUserStrict: () => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        get() {
          return Promise.resolve(session);
        }
        getCustomer() {
          return Promise.resolve(customer);
        }
        listTransactions() {
          return Promise.resolve(transactions);
        }
        closeSession() {
          return Promise.resolve(true);
        }
        getCampaign() {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), class {
        constructor(){}
        getTransactionProducts(){
          return products;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities.js'), {
        publish: () => {
          return Promise.resolve();
        },
        getRegion: () => 'localhost'
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      return confirmOrderController.execute(event).then(result => {
        expect(result).to.have.property('transactions');
        expect(result).to.have.property('customer');
        expect(result).to.have.property('session');
        expect(result).to.have.property('transaction_products');
        expect(result.transactions).to.deep.equal(transactions);
        expect(result.customer).to.deep.equal(customer);
        expect(result.session).to.deep.equal(session);
        expect(result.transaction_products).to.deep.equal(products);
      });

    });

  });

  describe('confirmOrder', () => {

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

      let event = getValidEventBody();
      let session = getValidSession();
      let transactions = getValidTransactions();
      let products = getValidTransactionProducts(null, true);
      let customer = getValidCustomer();
      let campaign = getValidCampaign();

      session.completed = false;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), {
        get:() => {
          return Promise.resolve(session)
        },
        isEmail: () => {
          return true;
        },
        getUserStrict: () => {
          return Promise.resolve({});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        get() {
          return Promise.resolve(session);
        }
        getCustomer() {
          return Promise.resolve(customer);
        }
        listTransactions() {
          return Promise.resolve(transactions);
        }
        closeSession() {
          return Promise.resolve(true);
        }
        getCampaign() {
          return Promise.resolve(campaign);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), class {
        constructor(){}
        getTransactionProducts(){
          return products;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities.js'), {
        publish: () => {
          return Promise.resolve();
        },
        getRegion: () => 'localhost'
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

      confirmOrderController.parameters.set('event', event);

      return confirmOrderController.confirmOrder(event).then(result => {
        expect(result).to.have.property('transactions');
        expect(result).to.have.property('customer');
        expect(result).to.have.property('session');
        expect(result).to.have.property('transaction_products');
        expect(result.transactions).to.deep.equal(transactions);
        expect(result.customer).to.deep.equal(customer);
        expect(result.session).to.deep.equal(session);
        expect(result.transaction_products).to.deep.equal(products);
      });

    });

  });

});
