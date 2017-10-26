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

const VoidHelperController = global.SixCRM.routes.include('helpers', 'transaction/Void.js');

function getValidVoidParameters(){

  let transaction = getValidTransaction();

  transaction.processor_response = JSON.parse(transaction.processor_response);

  return {
    transaction: transaction
  };

}

function assumePermissionedRole(){

  //This doesn't work
  global.user = {
  	"name":"Owner Test User",
  	"first_name": "Owner",
  	"last_name": "Test User",
  	"auth0_id":"google-oauth2|115021313586107803846",
  	"id":"owner.user@test.com",
  	"active":true,
  	"termsandconditions":"0.1",
  	"alias":"9a47a739432d7f12d233a27fab6d36f9a65db3a2",
  	"created_at":"2017-04-06T18:40:41.405Z",
  	"updated_at":"2017-04-06T18:41:12.521Z",
    "acls":[
      {
          "id":"1d28d82f-87f1-48eb-9a25-13513956776a",
          "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
          "user":"owner.user@test.com",
          "role":"cae614de-ce8a-40b9-8137-3d3bdff78039",
          "created_at":"2017-04-06T18:40:41.405Z",
          "updated_at":"2017-04-06T18:41:12.521Z"
      }
    ]
  };

  global.account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';

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

describe('helpers/transaction/Void.js', () => {

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

      it('successfully constructs a void class', () => {

        let vh = new VoidHelperController();

        expect(vh.constructor.name).to.equal('Void');

      });

    });

    describe('setParameters', () => {

      it('fails to set parameters', () => {

        let vh = new VoidHelperController();
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

        let vh = new VoidHelperController();

        let valid_parameters = getValidParameters();

        vh.setParameters(valid_parameters);

      });

    });

    describe('hydrateParameters', () => {

      it('successfully hydrates the parameters', () => {

        //assumePermissionedRole();

        let vh = new VoidHelperController();

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

      it('successfully hydrates the parameters', () => {

        let vh = new VoidHelperController();

        vh.parameters.set('transaction', getValidTransaction());

        return vh.createProcessingParameters().then(processing_parameters => {

          expect(processing_parameters).to.have.property('transaction');

          expect(vh.parameters.get('void')).to.deep.equal(processing_parameters);

        });

      });

    });

    describe('void', () => {

      it('successfully voids a transaction', () => {

          //Test: complete

      });

    });

});
