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

const TransactionUtilitiesHelperController = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

function getInvalidArgumentsArray(omit){

  let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

  omit = (_.isUndefined(omit))?[]:omit;

  return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
    if(arrayutilities.nonEmpty(omit)){
      return !(_.contains(omit, invalid_argument));
    }
    return true;
  });

}

function getValidGatewayConstructorNames(){

  return ['NMIController', 'InnovioController'];

}

function getValidSelectedMerchantProvidersArray(){

  return [
    {
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
      summary: {
        today: {
          count: 0,
          amount: 0.00
        },
        thisweek: {
          count: 0,
          amount: 0.00
        },
        thismonth: {
          count: 0,
          amount: 400.00
        }
      },
    	created_at:"2017-04-06T18:40:41.405Z",
    	updated_at:"2017-04-06T18:41:12.521Z"
    },
    {
    	id:"79189a4a-ed89-4742-aa96-afcd7f6c08fb",
    	account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    	name:"NMI Account 2",
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
    		password:"password"
    	},
    	allow_prepaid:true,
    	accepted_payment_methods:["Visa", "Mastercard", "American Express"],
    	customer_service:{
    		email:"customer.service@mid.com",
    		url:"http://mid.com",
    		description:"Some string here..."
    	},
      summary: {
        today: {
          count: 0,
          amount: 0.00
        },
        thisweek: {
          count: 0,
          amount: 0.00
        },
        thismonth: {
          count: 0,
          amount: 34.29
        }
      },
    	created_at:"2017-04-06T18:40:41.405Z",
    	updated_at:"2017-04-06T18:41:12.521Z"
    }
  ];

}

describe('helpers/transaction/TransactionUtilities.spec.js', () => {

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

  describe('makeGeneralBrandString', () => {

    it('Fails for invalid arguments generates a brand string',  () => {

      let transactionUtilitiesController = new TransactionUtilitiesHelperController();

      let invalid_arguments = getInvalidArgumentsArray({omit: ['abc']});

      arrayutilities.map(invalid_arguments, invalid_argument => {

        try{
          transactionUtilitiesController.makeGeneralBrandString(invalid_argument);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

      });

    });

    it('Successfully generates a brand string',  () => {

      let transactionUtilitiesController = new TransactionUtilitiesHelperController();

      let brandstring = transactionUtilitiesController.makeGeneralBrandString('American Express');

      expect(brandstring).to.equal('americanexpress');


    });

  });

  describe('setParameters', () => {

    it('fails to set parameters', () => {

      let transactionUtilitiesController = new TransactionUtilitiesHelperController();

      transactionUtilitiesController.parameters = {required:{}, optional:{}};
      let invalid_arguments_array = getInvalidArgumentsArray();

      arrayutilities.map(invalid_arguments_array, invalid_argument => {
        try{
          transactionUtilitiesController.setParameters(invalid_argument);
        }catch(error){
          expect(error.message).to.be.defined;
        }
      });
    });

  });

  describe('validateParameters', () => {

    //Technical Debt:  Test failures...
    it('passes when parameters validate', () => {

      let transactionUtilitiesController = new TransactionUtilitiesHelperController();

      transactionUtilitiesController.parameter_definitions = {
        required:{},
        optional:{}
      };

      //set required and optional
      let parameters = {

      };

      transactionUtilitiesController.setParameters(parameters);

      let validated = transactionUtilitiesController.validateParameters();

      expect(validated).to.equal(true);

    });

  });

  describe('instantiateParameters', () => {

  });

  describe('instantiateGateway', () => {

    //Technical Debt: Validate unhappy stuff...

    it('successfully instantiates a processor gateway class ', () => {

      let merchantproviders = getValidSelectedMerchantProvidersArray();

      let instantiated_gateways = arrayutilities.map(merchantproviders, merchantprovider => {

        let transactionUtilitiesController = new TransactionUtilitiesHelperController();

        transactionUtilitiesController.parameters.set('selected_merchantprovider', merchantprovider);

        return transactionUtilitiesController.instantiateGateway()
        .then(() => {
          return transactionUtilitiesController.parameters.get('instantiated_gateway');
        });

      });

      return Promise.all(instantiated_gateways).then(instantiated_gateways => {
        arrayutilities.map(instantiated_gateways, instantiated_gateway => {
          expect(_.contains(getValidGatewayConstructorNames(), instantiated_gateway.constructor.name)).to.equal(true);
        });
      });

    });

  });

});
