'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const ReceiptController = global.SixCRM.routes.include('providers', 'register/Receipt.js');

function getValidTransformedTransactionPrototype(){

  return {
    rebill: '70de203e-f2fd-45d3-918b-460570338c9b',
    processor_response: '{"code":"success","result":{"message":"Success","result":{"response":"1","responsetext":"SUCCESS","authcode":"123456","transactionid":"3448894418","avsresponse":"N","cvvresponse":"","orderid":"","type":"sale","response_code":"100"}},"message":"Some message"}',
    amount: 79.99,
    products:[
      {
        product: 'be992cea-e4be-4d3e-9afa-8e020340ed16',
        amount: 34.99
      }
    ],
    alias: 'TCJQVXW5F3',
    merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
    type: 'sale',
    result: 'success'
  }

}
function getValidTransactionPrototype(){

  return {
    rebill:{
      bill_at: '2017-04-06T18:40:41.405Z',
      id: '70de203e-f2fd-45d3-918b-460570338c9b',
      account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
      product_schedules: [ '2200669e-5e49-4335-9995-9c02f041d91b' ],
      amount: 79.99,
      created_at: '2017-04-06T18:40:41.405Z',
      updated_at: '2017-04-06T18:41:12.521Z'
    },
    amount: 79.99,
    type: 'sale',
    result: 'success',
    processor_response: {
     code: 'success',
     result: {
       message: 'Success',
       result: {
         response: '1',
         responsetext: 'SUCCESS',
         authcode: '123456',
         transactionid: '3448894418',
         avsresponse: 'N',
         cvvresponse: '',
         orderid: '',
         type: 'sale',
         response_code: '100'
       }
     },
     message: 'Some message'
   },
   merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
   products:[
     {
       product: 'be992cea-e4be-4d3e-9afa-8e020340ed16',
       amount: 34.99
     }
   ]
 };

}

function getValidTransaction(){
  return {
    "amount": 34.99,
    "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
    "alias":"T56S2HJO32",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "type":"sale",
    "result":"success",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };
}

function getValidMerchantProvider(){

  return {
    id:"6c40761d-8919-4ad6-884d-6a46a776cfb9",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    name:"NMI Account 1",
    processor:{
      name:"NMA",
      id:"someIDValue"
    },
    processing:{
      monthly_cap: 50000.00,
      discount_rate:0.9,
      transaction_fee:0.06,
      reserve_rate: 0.5,
      maximum_chargeback_ratio:0.17,
      transaction_counts:{
        daily:30,
        monthly:30,
        weekly:30
      }
    },
    enabled:true,
    gateway: {
      name:"NMI",
      username:"demo",
      password:"password",
    },
    allow_prepaid:true,
    accepted_payment_methods:["Visa", "Mastercard", "American Express"],
    customer_service:{
      email:"customer.service@mid.com",
      url:"http://mid.com",
      description:"Some string here..."
    },
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

function getValidTransactionProducts(){

  return [{
    "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
    "amount":34.99
  }];

}

function getValidRebill(){

  return {
    "bill_at": "2017-04-06T18:40:41.405Z",
    "id": "70de203e-f2fd-45d3-918b-460570338c9b",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "parentsession": "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
    "product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
    "amount": 79.99,
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };

}

function getValidAmount(){
  return 79.99;
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

describe('controllers/providers/register/Receipt.js', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {
    it('successfully constructs', () => {
      let receiptController = new ReceiptController();

      expect(objectutilities.getClassName(receiptController)).to.equal('RegisterRecieptGenerator');
    });
  });

  describe('createTransactionPrototype', () => {
    it('successfully creates transaction prototype for process', () => {

      let receiptController = new ReceiptController();

      receiptController.parameters.set('rebill', getValidRebill());
      receiptController.parameters.set('amount', getValidRebill().amount);
      receiptController.parameters.set('transactiontype', 'sale');
      receiptController.parameters.set('processorresponse', getValidProcessorResponse());
      receiptController.parameters.set('merchantprovider', getValidMerchantProvider());
      receiptController.parameters.set('transactionproducts', getValidTransactionProducts());

      return receiptController.createTransactionPrototype().then((response) => {
        expect(response).to.equal(true);
        let transaction_prototype = receiptController.parameters.get('transactionprototype');

        du.info(transaction_prototype);
        expect(transaction_prototype).to.have.property('rebill');
        expect(transaction_prototype).to.have.property('amount');
        expect(transaction_prototype).to.have.property('processor_response');
        expect(transaction_prototype).to.have.property('type');
        expect(transaction_prototype).to.have.property('result');
        expect(transaction_prototype).to.have.property('merchant_provider');
        expect(transaction_prototype).to.have.property('products');
      });

    });

    it('successfully creates transaction prototype for refund', () => {

      let receiptController = new ReceiptController();

      receiptController.parameters.set('rebill', getValidRebill());
      receiptController.parameters.set('transactiontype', 'refund');
      receiptController.parameters.set('processorresponse', getValidProcessorResponse());
      receiptController.parameters.set('associatedtransaction', getValidTransaction());
      receiptController.parameters.set('amount', getValidTransaction().amount);

      return receiptController.createTransactionPrototype().then((response) => {
        expect(response).to.equal(true);
        let transaction_prototype = receiptController.parameters.get('transactionprototype');

        expect(transaction_prototype).to.have.property('rebill');
        expect(transaction_prototype).to.have.property('amount');
        expect(transaction_prototype).to.have.property('processor_response');
        expect(transaction_prototype).to.have.property('type');
        expect(transaction_prototype).to.have.property('result');
        expect(transaction_prototype).to.have.property('merchant_provider');
        expect(transaction_prototype).to.have.property('products');
        expect(transaction_prototype).to.have.property('associated_transaction');
      });

    });

    it('successfully creates transaction prototype for reverse', () => {

      let receiptController = new ReceiptController();

      receiptController.parameters.set('rebill', getValidRebill());
      receiptController.parameters.set('transactiontype', 'reverse');
      receiptController.parameters.set('processorresponse', getValidProcessorResponse());
      receiptController.parameters.set('associatedtransaction', getValidTransaction());
      receiptController.parameters.set('amount', getValidTransaction().amount);

      return receiptController.createTransactionPrototype().then((response) => {
        expect(response).to.equal(true);
        let transaction_prototype = receiptController.parameters.get('transactionprototype');

        expect(transaction_prototype).to.have.property('rebill');
        expect(transaction_prototype).to.have.property('amount');
        expect(transaction_prototype).to.have.property('processor_response');
        expect(transaction_prototype).to.have.property('type');
        expect(transaction_prototype).to.have.property('result');
        expect(transaction_prototype).to.have.property('merchant_provider');
        expect(transaction_prototype).to.have.property('products');
        expect(transaction_prototype).to.have.property('associated_transaction');
      });

    });
  });

  describe('transformTransactionPrototypeObject', () => {
    it('successfully transforms transaction prototype', () => {
      let receiptController = new ReceiptController();

      receiptController.parameters.set('transactionprototype', getValidTransactionPrototype());
      receiptController.transformTransactionPrototypeObject();
      let transformed_transaction_prototype = receiptController.parameters.get('transformed_transaction_prototype');

      expect(transformed_transaction_prototype).to.have.property('rebill');
      expect(transformed_transaction_prototype).to.have.property('processor_response');
      expect(transformed_transaction_prototype).to.have.property('amount');
      expect(transformed_transaction_prototype).to.have.property('products');
      expect(transformed_transaction_prototype).to.have.property('alias');
      expect(transformed_transaction_prototype).to.have.property('merchant_provider');
      expect(transformed_transaction_prototype).to.have.property('type');
      expect(transformed_transaction_prototype).to.have.property('result');
    });
  });

  describe('createTransaction', () => {
    it('successfully creates a transaction record', () => {

      PermissionTestGenerators.givenUserWithAllowed('*', '*');

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

      let receiptController = new ReceiptController();

      receiptController.parameters.set('transformed_transaction_prototype', getValidTransformedTransactionPrototype());
      return receiptController.createTransaction().then(() => {
        let receipt_transaction = receiptController.parameters.get('receipt_transaction');

        expect(receipt_transaction).to.have.property('id');
      });
    });
  });

  describe('issueReceipt', () => {
    it('successfully issues a receipt', () => {

      PermissionTestGenerators.givenUserWithAllowed('*', '*');

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

      let issue_receipt_arguments = {
        rebill: getValidRebill(),
        amount: getValidRebill().amount,
        transactiontype: 'sale',
        processorresponse: getValidProcessorResponse(),
        merchantprovider: getValidMerchantProvider(),
        transactionproducts: getValidTransactionProducts()
      };

      let receiptController = new ReceiptController();

      return receiptController.issueReceipt({argumentation: issue_receipt_arguments}).then(() => {
        let receipt_transaction = receiptController.parameters.get('receipt_transaction');

        expect(receipt_transaction).to.have.property('id');
      })
    });
  });

});
