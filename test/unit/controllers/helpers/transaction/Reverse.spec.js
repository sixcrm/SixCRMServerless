'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

let expect = chai.expect;
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const ReverseHelperController = global.SixCRM.routes.include('helpers', 'transaction/Reverse.js');

function getValidReverseParameters(){

  let transaction = getValidTransaction();

  transaction.processor_response = JSON.parse(transaction.processor_response);

  return {
    transaction: transaction
  };

}

function assumePermissionedRole(){

  let permissions = [
    {
      action:'*',
      object: '*'
    }
  ];

  PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}


function getInvalidArgumentsArray(omit){

  let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

  omit = (_.isUndefined(omit))?[]:omit;
  return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
    return !(_.contains(omit, invalid_argument));
  });

}

function getValidTransaction(){
  return {
    "amount": 34.99,
    "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
    "alias":"T56S2HJO32",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"results\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };
}

function getTransactionMerchantProvider(){

  return {
		"id":"6c40761d-8919-4ad6-884d-6a46a776cfb9",
		"account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		"name":"NMI Account 1",
		"processor":{
			"name":"NMA"
		},
		"processing":{
			"monthly_cap": 2000000.00,
			"discount_rate":0.9,
			"transaction_fee":0.06,
			"reserve_rate": 0.5,
			"maximum_chargeback_ratio":0.17,
			"transaction_counts":{
				"daily":200000,
				"monthly":200000,
				"weekly":200000
			}
		},
		"enabled":true,
		"gateway": {
			"type":"NMI",
			"name":"NMI",
			"username":"demo",
			"password":"password",
			"endpoint":"https://secure.networkmerchants.com/api/transact.php"
		},
		"allow_prepaid":true,
		"accepted_payment_methods":["Visa", "Mastercard", "American Express","LOCAL CARD"],
		"customer_service":{
			"email":"customer.service@mid.com",
			"url":"http://mid.com",
			"description":"Some string here..."
		},
		"created_at":"2017-04-06T18:40:41.405Z",
		"updated_at":"2017-04-06T18:41:12.521Z"
	};

}

function getValidParameters(){

  return {
    transaction: getValidTransaction()
  }

}

describe('helpers/transaction/Reverse.js', () => {

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

    describe('constructor', () => {

      it('successfully constructs a reverse class', () => {

        let vh = new ReverseHelperController();

        expect(vh.constructor.name).to.equal('Reverse');

      });

    });

    describe('setParameters', () => {

      it('fails to set parameters', () => {

        let vh = new ReverseHelperController();
        let invalid_arguments_array = getInvalidArgumentsArray();

        arrayutilities.map(invalid_arguments_array, invalid_argument => {
          try{
            vh.setParameters(invalid_argument);
          }catch(error){
            expect(error.message).to.be.defined;
          }
        });
      });

      it('successfully sets parameters', () => {

        let vh = new ReverseHelperController();

        let valid_parameters = getValidParameters();

        vh.setParameters(valid_parameters);

      });

    });

    describe('hydrateParameters', () => {

      it('successfully hydrates the parameters', () => {

        assumePermissionedRole();

        let merchant_provider = getTransactionMerchantProvider();
        let transaction = getValidTransaction();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
          getMerchantProvider:(transaction) => {
            return Promise.resolve(merchant_provider);
          },
          get:({id}) => {
            return Promise.resolve(transaction);
          }
        });

        let vh = new ReverseHelperController();

        let valid_parameters = getValidParameters();

        vh.parameters.set('transaction', valid_parameters.transaction);

        return vh.hydrateParameters().then(result => {
          expect(result).to.equal(true);

          let test_merchantprovider = getTransactionMerchantProvider();
          let hydrated_merchantprovider = vh.parameters.get('selected_merchantprovider');

          delete hydrated_merchantprovider.created_at;
          delete hydrated_merchantprovider.updated_at;
          delete test_merchantprovider.created_at;
          delete test_merchantprovider.updated_at;

          expect(test_merchantprovider).to.deep.equal(hydrated_merchantprovider);

        });

      });

    });

    describe('createProcessingParameters', () => {

      //fails when transaction isn't set
      //fails when transaction isn't the right thing...

      it('successfully creates processing parameters', () => {

        //assumePermissionedRole();

        let vh = new ReverseHelperController();

        vh.parameters.set('transaction', getValidTransaction());

        return vh.createProcessingParameters().then(processing_parameters => {

          expect(processing_parameters).to.have.property('transaction');

          expect(vh.parameters.get('reverse')).to.deep.equal(processing_parameters);

        });

      });

    });

    describe('reverse', () => {

      it('successfully reverses a transaction', () => {

        assumePermissionedRole()

        let merchant_provider = getTransactionMerchantProvider();
        let transaction = getValidTransaction();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
          getMerchantProvider:(transaction) => {
            return Promise.resolve(merchant_provider);
          },
          get:({id}) => {
            return Promise.resolve(transaction);
          }
        });

        let mock_gateway = class {
          constructor(){}
          reverse({argumentation}){
            return Promise.resolve(
              {
                code: 200,
                result: 'success',
                message: 'Success'
              }
            );
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('vendors', 'merchantproviders/NMI/handler.js'), mock_gateway);

        let vh = new ReverseHelperController();

        return vh.reverse({transaction:transaction}).then(result => {
          expect(result).to.have.property('code');
          expect(result).to.have.property('result');
          expect(result).to.have.property('message');
        });

      });

    });

});
