'use strict'

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

let expect = chai.expect;
let du = global.routes.include('lib', 'debug-utilities.js');
let mvu = global.routes.include('lib', 'model-validator-utilities.js');
let timestamp = global.routes.include('lib', 'timestamp.js');
let mathutilities = global.routes.include('lib', 'math-utilities.js');
let arrayutilities = global.routes.include('lib', 'array-utilities.js');

const processHelperController = global.routes.include('helpers', 'transaction/Process.js');

function getValidMerchantProviderSummaries(){
  return [{
    merchantprovider:{
      id: '6c40761d-8919-4ad6-884d-6a46a776cfb9'
    },
    summary: {
      today: {
        count: 0,
        amount: 0
      },
      thisweek: {
        count: 0,
        amount: 0
      },
      thismonth: {
        count: 0,
        amount: 400.00
      }
    }
  },{
    merchantprovider:{
      id: '79189a4a-ed89-4742-aa96-afcd7f6c08fb'
    },
    summary: {
      today: {
        count: 0,
        amount: 0
      },
      thisweek: {
        count: 0,
        amount: 0
      },
      thismonth: {
        count: 0,
        amount: 34.29
      }
    }
  }];
}

function getValidMerchantProviders(){

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
  			endpoint:"https://secure.networkmerchants.com/api/transact.php",
  			additional:"{\"processor_id\":123}"
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
  			password:"password",
  			endpoint:"https://secure.networkmerchants.com/api/transact.php",
  			additional:"{\"processor_id\":123}"
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
  	}
  ];

}

function getValidCreditCardProperties(){

  return {
    binnumber: 411111,
    brand: 'Visa',
    bank: 'Some Bank',
    type: 'Classic',
    level: 'level',
    country: 'USA',
    info: '',
    country_iso: 'USA',
    country2_iso: 'USA',
    country3_iso: 'USA',
    webpage: 'www.bankofamerica.com',
    phone: '15032423612'
  };

}

function getValidLoadBalancer(){

  return {
  	id:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
  	account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  	merchantproviders:[
  		{
  			id:"6c40761d-8919-4ad6-884d-6a46a776cfb9",
  			distribution:0.75
  		},
  		{
  			id:"79189a4a-ed89-4742-aa96-afcd7f6c08fb",
  			distribution:0.25
  		}
  	],
  	created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

function getValidCreditCard(){

    return {
    	id: "df84f7bb-06bd-4daa-b1a3-6a2c113edd72",
    	account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    	address: {
    		city: "Portland",
    		country: "USA",
    		line1: "10 Skid Rw.",
    		line2: "Suite 100",
    	  state: "Oregon",
    		zip: "97213"
    	},
    	number: "4111111111111111",
    	ccv: "999",
    	expiration: "1025",
    	name: "Rama Damunaste",
    	created_at:"2017-04-06T18:40:41.405Z",
    	updated_at:"2017-04-06T18:41:12.521Z"
    };

}

function getValidCustomer(){

    return {
      id:"24f7c851-29d4-4af9-87c5-0298fa74c689",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      email:"rama@damunaste.org",
      firstname:"Rama",
      lastname:"Damunaste",
      phone:"1234567890",
      address:{
        line1:"10 Downing St.",
        city:"London",
        state:"Oregon",
        zip:"97213",
        country:"US"
      },
      creditcards:["df84f7bb-06bd-4daa-b1a3-6a2c113edd72"],
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    };

}

function getValidProductSchedule(){

  return {
    id:"12529a17-ac32-4e46-b05b-83862843055d",
    name:"Product Schedule 1",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    loadbalancers:["927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3"],
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
        period:30
      }
    ],
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

describe('helpers/transaction/Process.spec.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    it('filters the merchantprovider list', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal(merchantproviders);

      });

    });

    it('selects a merchantprovider', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      creditcard.properties = creditcard_properties;

      let product_schedule = {};

      mockery.registerMock(global.routes.path('entities', 'ProductSchedule.js'), {
        getLoadBalancers: (product_schedule) => {
          return Promise.resolve([loadbalancer]);
        }
      });

      mockery.registerMock(global.routes.path('entities', 'LoadBalancer.js'), {
        getMerchantProviders: (loadbalancer) => {
          return Promise.resolve(merchantproviders);
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      mockery.registerMock(global.routes.path('analytics', 'Analytics.js'), {
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve(merchantprovider_summaries);
        }
      });

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.selectMerchantProvider().then((result) => {

        expect(result).to.deep.equal(merchantproviders[1]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to disabled status', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].enabled = false;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to invalid accepted_payment_methods', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].accepted_payment_methods = ["Monopoly Money"];

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to CAP restrictions', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.thismonth.amount = 52000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to daily count restrictions', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.today.count = 30;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to weekly count restrictions', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.thisweek.count = 120;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the first merchant provider the merchantprovider list due to monthly count restrictions', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.thismonth.count = 628;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.filterMerchantProviders().then((result) => {

        expect(result).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filters the merchant provider list by LSS', () => {

      let loadbalancer = getValidLoadBalancer();
      let creditcard = getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.selected_credit_card = creditcard;

      return ph.selectMerchantProviderWithDistributionLeastSumOfSquares().then((result) => {

        expect(result).to.deep.equal(merchantproviders[1]);

      });

    });

    it('fails when required parameters are not presented', () => {

      let ph = new processHelperController();
      let parameters = {};

      try{
        ph.setParameters(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Process class parameters missing required field:"customer".');
      };

      parameters = {
        customer: ''
      }

      try{
        ph.setParameters(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Process class parameters missing required field:"productschedule".');
      };

      parameters = {
        customer: '',
        productschedule: ''
      };

      try{
        ph.setParameters(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Process class parameters missing required field:"amount".');
      };

    });

    it('succeeds when required parameters are present', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: '',
        productschedule: '',
        amount: ''
      };

      ph.setParameters(parameters);

      expect(ph.customer).to.equal(parameters.customer);
      expect(ph.productschedule).to.equal(parameters.productschedule);
      expect(ph.amount).to.equal(parameters.amount);

    });

    it('sets optional parameters', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: '',
        productschedule: '',
        amount: '',
        merchantprovider: '123'
      };

      ph.setParameters(parameters);

      expect(ph.merchantprovider).to.equal('123');

    });

    it('does not set non-whitelisted optional parameters', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: '',
        productschedule: '',
        amount: '',
        merchantprovider: '123',
        somethingelse:'abc123'
      };

      ph.setParameters(parameters);

      expect(ph.somethingelse).to.be.undefined;

    });

    it('successfully hydrates customers', () => {

      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();

      mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
            callback(null, [customer]);
        }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: customer.id,
        productschedule: productschedule,
        amount: '',
        merchantprovider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      };

      ph.setParameters(parameters);

      return ph.hydrateParameters().then(() => {

        expect(ph.customer).to.equal(customer);

      });

    });

    it('successfully hydrates product schedules', () => {

      let productschedule = getValidProductSchedule();
      let customer = getValidCustomer();

      mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
            callback(null, [productschedule]);
        }
      });

      mockery.registerMock(global.routes.path('entities', 'ProductSchedule.js'), {
        get: (product_schedule_id) => {
          return Promise.resolve(productschedule);
        },
        isUUID:() => {
          return true;
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let ph = new processHelperController();

      let parameters = {
        customer: customer,
        productschedule: productschedule.id,
        amount: '',
        merchantprovider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      };

      ph.setParameters(parameters);

      return ph.hydrateParameters().then(() => {

        expect(ph.productschedule).to.equal(productschedule);

      });

    });

    it('fails when required parameters do not validate', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: '123',
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      ph.setParameters(parameters);

      try{
        ph.validateParameters();
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      };

      ph = new processHelperController();

      parameters = {
        customer: getValidCustomer(),
        productschedule: 'abc',
        amount: '12.99'
      };

      ph.setParameters(parameters);

      try{
        ph.validateParameters();
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      };

      ph = new processHelperController();

      parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99.'
      };

      ph.setParameters(parameters);

      try{
        ph.validateParameters();
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      };

      parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: -12.99
      };

      ph.setParameters(parameters);

      try{
        ph.validateParameters();
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      };

    });

    it('fails when customer is missing a credit card', () => {

      let ph = new processHelperController();

      let customer = getValidCustomer();

      customer.creditcards = [];

      let parameters = {
        customer: customer,
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      ph.setParameters(parameters);

      try{
        ph.validateParameters();
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      };

    });

    it('passes when parameters validate', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: 12.99
      };

      ph.setParameters(parameters);

      let validated = false;

      try{
       validated = ph.validateParameters();
      }catch(e){
       du.warning(e);
      }

      expect(validated).to.equal(true);

    });

    it('hydrates credit cards', () => {

      let credit_card = getValidCreditCard();

      mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
          queryRecords: (table, parameters, index, callback) => {
              callback(null, [credit_card]);
          }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      ph.setParameters(parameters);

      return ph.hydrateCreditCards().then(() => {

        ph.customer.creditcards.forEach((credit_card) => {

          let validated = mvu.validateModel(credit_card, global.routes.path('model','entities/creditcard.json'));

          expect(validated).to.equal(true);

        });

        return true;

      });

    });

    it('selects the default credit card', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      let cc_1 = getValidCreditCard();
      let cc_2 = cc_1;

      cc_2.id = uuidV4();
      let cc_3 = cc_2;

      cc_3.id = uuidV4();

      cc_2.default = true;

      parameters.customer.creditcards = [cc_1, cc_2, cc_3];

      ph.setParameters(parameters);

      return ph.selectCustomerCreditCard().then(selected_credit_card => {
        expect(selected_credit_card).to.equal(cc_2);
      });

    });

    it('selects the most recently updated credit card', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      let cc_1 = getValidCreditCard();
      let cc_2 = cc_1;

      cc_2.id = uuidV4();
      let cc_3 = cc_2;

      cc_3.id = uuidV4();

      cc_2.updated_at = timestamp.getISO8601();

      parameters.customer.creditcards = [cc_1, cc_2, cc_3];

      ph.setParameters(parameters);

      return ph.selectCustomerCreditCard().then(selected_credit_card => {
        expect(selected_credit_card).to.equal(cc_1);
      })

    });

    it('selects the first credit card', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      let cc_1 = getValidCreditCard();
      let cc_2 = cc_1;

      cc_2.id = uuidV4();
      let cc_3 = cc_2;

      cc_3.id = uuidV4();

      //cc_2.updated_at = timestamp.getISO8601();

      parameters.customer.creditcards = [cc_1, cc_2, cc_3];

      ph.setParameters(parameters);

      return ph.selectCustomerCreditCard().then(selected_credit_card => {
        expect(selected_credit_card).to.equal(cc_1);
      })

    });

    it('sets the correct bin number', () => {

      let ph = new processHelperController();

      ph.selected_credit_card = getValidCreditCard();

      let bin_number = ph.setBINNumber();

      expect(bin_number).to.equal(ph.selected_credit_card.bin.substring(0, 6));

    });

    it('retrieves selected credit card properties', () => {

      let cc_properties= getValidCreditCardProperties();

      mockery.registerMock(global.routes.path('analytics', 'Analytics.js'), {
          getBINList: (parameters) => {
              return Promise.resolve({bins:[cc_properties], pagination: {}});
          }
      });

      let ph = new processHelperController();

      ph.selected_credit_card = getValidCreditCard();
      ph.setBINNumber();

      return ph.getSelectedCreditCardProperties().then(selected_credit_card_properties => {

        expect(ph.selected_credit_card.properties).to.equal(cc_properties);

      });

    });

    it('retrieves the loadbalancers', () => {

      let lb_1 = getValidLoadBalancer();
      let lb_2 = lb_1;

      lb_2.id = uuidV4();

      mockery.registerMock(global.routes.path('entities', 'ProductSchedule.js'), {
          getLoadBalancers: (product_schedule) => {
              return Promise.resolve([lb_1, lb_2]);
          }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      let cc_1 = getValidCreditCard();

      parameters.customer.creditcards = [cc_1];
      parameters.productschedule.loadbalancers.push(lb_2.id);

      ph.setParameters(parameters);

      return ph.getLoadBalancers().then(loadbalancers => {

        expect(loadbalancers).to.deep.equal([lb_1, lb_2]);
        expect(ph.loadbalancers).to.deep.equal([lb_1, lb_2]);

      });

    });

    it('fails to select a loadbalancer if loadbalancers are not set', () => {

      let ph = new processHelperController();

      return ph.selectLoadBalancer().catch(error => {
        expect(error.message).to.equal('[500] Loadbalancers must be set before selecting a loadbalancer.');
      });

    });

    it('selects a load balancer', () => {

      let lb_1 = getValidLoadBalancer();
      let lb_2 = lb_1;

      lb_2.id = uuidV4();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: '12.99'
      };

      let cc_1 = getValidCreditCard();

      parameters.customer.creditcards = [cc_1];
      parameters.productschedule.loadbalancers.push(lb_2.id);

      let ph = new processHelperController();

      ph.loadbalancers = [lb_1, lb_2];

      ph.setParameters(parameters);

      return ph.selectLoadBalancer().then(loadbalancer => {

        expect(ph).to.have.property('selected_loadbalancer');
        expect(ph.selected_loadbalancer).to.equal(lb_1);

      });

    });

    it('retrieves merchant providers', () => {

      let merchantproviders = getValidMerchantProviders();

      mockery.registerMock(global.routes.path('entities', 'LoadBalancer.js'), {
        getMerchantProviders:(loadbalancer) => {
            ph.merchantproviders = merchantproviders;
            return Promise.resolve(merchantproviders);
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let ph = new processHelperController();

      let lb_1 = getValidLoadBalancer();

      ph.selected_loadbalancer = lb_1;

      return ph.getMerchantProviders().then(result => {

        expect(result).to.equal(merchantproviders);
        expect(ph.merchantproviders).to.equal(merchantproviders);

      });

    });

    it('filter disabled merchant provider list', () => {

      let merchantproviders = getValidMerchantProviders();

      merchantproviders[0].enabled = false;
      merchantproviders[1].enabled = true;

      let ph = new processHelperController();

      return ph.filterDisabledMerchantProviders(merchantproviders).then(filtered_merchantproviders => {

        expect(filtered_merchantproviders).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('no filter of typed merchant provider list', () => {

      let merchantproviders = getValidMerchantProviders();

      merchantproviders[0].allowed_payment_methods = ['Visa','Mastercard'];
      merchantproviders[1].allowed_payment_methods = ['Visa', 'American Express'];

      let ph = new processHelperController();

      ph.selected_credit_card = getValidCreditCard();
      ph.selected_credit_card.properties = getValidCreditCardProperties();

      return ph.filterTypeMismatchedMerchantProviders(merchantproviders).then(filtered_merchantproviders => {

        expect(filtered_merchantproviders).to.deep.equal(merchantproviders);

      });

    });

    it('filter type mismatched merchant provider', () => {

      let merchantproviders = getValidMerchantProviders();

      merchantproviders[0].accepted_payment_methods = ['Visa','Mastercard'];
      merchantproviders[1].accepted_payment_methods = ['Visa', 'American Express'];

      let ph = new processHelperController();

      ph.selected_credit_card = getValidCreditCard();
      ph.selected_credit_card.properties = getValidCreditCardProperties();
      ph.selected_credit_card.properties.brand = 'American Express';

      return ph.filterTypeMismatchedMerchantProviders(merchantproviders).then(filtered_merchantproviders => {

        expect(filtered_merchantproviders).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('gets merchant provider summaries', () => {

      let merchantproviders = getValidMerchantProviders();

      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      mockery.registerMock(global.routes.path('controllers', 'analytics/Analytics.js'), {
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve(merchantprovider_summaries);
        }
      });

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;

      return ph.getMerchantProviderSummaries().then(results => {

        expect(results).to.deep.equal(merchantprovider_summaries);

      });

    });

    it('marries merchant provider list merchant provider summaries', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;
      ph.merchantprovider_summaries = merchantprovider_summaries;

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      return ph.marryMerchantProviderSummaries().then(() => {

        expect(ph.merchantproviders).to.deep.equal(merchantproviders);

      });

    });

    it('should not filter merchant provider list by model validation', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;

      return ph.filterInvalidMerchantProviders(ph.merchantproviders).then(results => {
        expect(results).to.deep.equal(ph.merchantproviders);
      });

    });

    it('should filter merchant provider list by model validation', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      return ph.filterInvalidMerchantProviders(merchantproviders).then((results) => {
        expect(results).to.deep.equal([merchantproviders[1]]);
      });

    });

    it('should not filter the merchant provider list by cap shoratges', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;

      return ph.filterCAPShortageMerchantProviders(ph.merchantproviders).then(results => {

        expect(results).to.deep.equal(merchantproviders);

      });

    });

    it('should not filter the merchant provider list by count shoratges', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      return ph.filterCountShortageMerchantProviders(merchantproviders).then(results => {

        expect(results).to.deep.equal(merchantproviders);

      });

    });

    it('filter count shortage (day) merchant provider list', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.today.count = merchantproviders[0].processing.transaction_counts.daily;

      let ph = new processHelperController();

      return ph.filterCountShortageMerchantProviders(merchantproviders).then(results => {

        expect(results).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filter count shortage (week) merchant provider list', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.thisweek.count = merchantproviders[0].processing.transaction_counts.weekly;

      let ph = new processHelperController();

      return ph.filterCountShortageMerchantProviders(merchantproviders).then(results => {

        expect(results).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('filter count shortage (month) merchant provider list', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      merchantproviders[0].summary.summary.thismonth.count = merchantproviders[0].processing.transaction_counts.monthly;

      let ph = new processHelperController();

      return ph.filterCountShortageMerchantProviders(merchantproviders).then(results => {

        expect(results).to.deep.equal([merchantproviders[1]]);

      });

    });

    it('retrieves the load balancer sum', () => {

      let loadbalancer = getValidLoadBalancer();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let sum = 0;

      merchantproviders.forEach(merchantprovider => {
        sum += merchantprovider.summary.summary.thismonth.amount;
      });

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;
      ph.selected_loadbalancer = loadbalancer;

      return ph.calculateLoadBalancerSum().then(result => {

        expect(result).to.equal(sum);

      });

    });

    it('fails to retrieve the load balancer sum due to missing selected_loadbalancer property', () => {

      let loadbalancer = getValidLoadBalancer();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let sum = 0;

      merchantproviders.forEach(merchantprovider => {
        sum += merchantprovider.summary.summary.thismonth.amount;
      });

      let ph = new processHelperController();

      ph.merchantproviders = merchantproviders;

      try{
        ph.calculateLoadBalancerSum();
      }catch(error){
          expect(error.message).to.equal('[500] Process.calculateLoadBalancerSum assumes the selected_loadbalancer property is set');
      }

    });

    it('should get a merchant provider target distribution', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;

      return ph.getMerchantProviderTargetDistribution(merchantproviders[1]).then((target_distribution) => {
        expect(target_distribution).to.equal(loadbalancer.merchantproviders[1].distribution);
      });

    });

    it('should get a merchant provider actual distribution', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.amount = 100.00;
      ph.selected_loadbalancer.monthly_sum = 4000.00;

      let expected_percentage = (mathutilities.safePercentage(3000, (4000+100), 8))/100;

      let hypothetical_distribution = ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1]);

      expect(hypothetical_distribution).to.equal(expected_percentage);

    });

    it('should get a merchant provider actual distribution with additional amount', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.amount = 100.00;
      ph.selected_loadbalancer.monthly_sum = 4000.00;

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      let base_distribution = ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], 100);

      expect(base_distribution).to.equal(expected_percentage);

    });

    it('fails to get merchant provider actual distribution due to missing amount property', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      try {

          ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], 100);

      }catch(error){

        expect(error.message).to.equal('[500] Process.getMerchantProviderDistribution assumes that amount property is set');

      }

    });

    it('fails to get a merchant provider actual distribution due to incorrect amount property type', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.amount = '100';
      ph.selected_loadbalancer.monthly_sum = 4000.00;

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      try{
        ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], 100);
      }catch(error){
        expect(error.message).to.equal('[500] Process.getMerchantProviderDistribution assumes that amount property is numeric');
      }

    });

    it('fails to get a merchant provider actual distribution because additional amount is incorrectly typed', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.amount = 100.00;
      ph.selected_loadbalancer.monthly_sum = 4000.00;

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      try{
        ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], '100')
      }catch(error){
        expect(error.message).to.equal('[500] Process.getMerchantProviderDistribution assumes that additional_amount argument is numeric');
      }

    });

    it('fails to select a merchant provider by Least Sum of Squares goal analysis because amount is not set', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;

      try{
        ph.selectMerchantProviderFromLSS()
      }catch(error){
        expect(error.message).to.equal('[500] Process.selectMerchantProviderFromLSS assumes hypothetical_distribution_base_array is set');
      }

    });

    it('selects a merchant provider by Least Sum of Squares goal analysis', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.target_distribution_array = [0.75, 0.25];
      ph.hypothetical_distribution_base_array = [0.84, 0.16];

      return ph.selectMerchantProviderFromLSS().then(result => {

        expect(result).to.equal(merchantproviders[1]);

      });

    });

    it('selects a different merchant provider by Least Sum of Squares goal analysis', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.selected_loadbalancer = loadbalancer;
      ph.selected_loadbalancer.monthly_sum = 4000.00;
      ph.merchantproviders = merchantproviders;
      ph.amount = 40.00;
      ph.target_distribution_array = [0.75, 0.25];
      ph.hypothetical_distribution_base_array = [0.1, 0.9];

      return ph.selectMerchantProviderFromLSS().then(result => {

        expect(result).to.equal(merchantproviders[0]);

      });

    });

    it('instantiates a processor class ', () => {

      let merchantproviders = getValidMerchantProviders();

      let ph = new processHelperController();

      ph.selected_merchantprovider = merchantproviders[0];

      return ph.instantiateGateway().then(response => {

        expect((ph.instantiated_gateway.constructor.name)).to.equal('NMIController');

      });

    });

    it('creates the processor parameters object', () => {

      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let amount = 40.00;
      let ph = new processHelperController();

      ph.customer = customer;
      ph.selected_credit_card = creditcard;
      ph.amount = amount;

      return ph.createProcessingParameters().then(parameters => {

        expect(parameters).to.deep.equal({customer: customer, creditcard: creditcard, amount: amount});

      });

    });

    it('processes a transaction', () => {

      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();
      let creditcard = getValidCreditCard();
      let creditcards = [creditcard];
      let loadbalancer = getValidLoadBalancer();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      let parameters = {
        customer: customer,
        productschedule: productschedule,
        amount: 40.00
      };

      let cc_properties= getValidCreditCardProperties();

      mockery.registerMock(global.routes.path('analytics', 'Analytics.js'), {
        getBINList: (parameters) => {
          return Promise.resolve({bins:[cc_properties], pagination: {}});
        },
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve(merchantprovider_summaries);
        }
      });

      mockery.registerMock(global.routes.path('entities', 'CreditCard.js'), {
        get:(creditcard_id) => {
          let creditcard = arrayutilities.find(creditcards, (a_creditcard) => {
            if(a_creditcard.id == creditcard_id){ return true; }
            return false;
          })

          return Promise.resolve(creditcard);
        },
        disableACLs: () => {},
        enableACLs: () => {},
        getBINNumber: (creditcard_number) => { return creditcard_number.slice(0, 6); }
      });

      mockery.registerMock(global.routes.path('entities', 'ProductSchedule.js'), {
        getLoadBalancers: (product_schedule) => {
          return Promise.resolve([loadbalancer]);
        }
      });

      mockery.registerMock(global.routes.path('entities', 'LoadBalancer.js'), {
        getMerchantProviders: (loadbalancer) => {
          return Promise.resolve(merchantproviders);
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let mock_nmi_class = class NMIController {
        constructor(parameters){
          return true;
        }
        process(parameters){
          return {
            message: 'Success',
            results:{
              response: '1',
              responsetext: 'SUCCESS',
              authcode: '123456',
              transactionid: '3690478718',
              avsresponse: 'N',
              cvvresponse: '',
              orderid: '',
              type: 'sale',
              response_code: '100'
            },
            merchant_provider: '79189a4a-ed89-4742-aa96-afcd7f6c08fb'
          }
        }
      }

      mockery.registerMock(global.routes.path('controllers', 'vendors/merchantproviders/NMI.js'), mock_nmi_class);

      let ph = new processHelperController();

      return ph.process(parameters).then((response) => {

        expect(response.message).to.equal('Success');
        expect(response.merchant_provider).to.equal(merchantproviders[1].id);
        expect(response.results).to.include({
          response: '1',
          responsetext: 'SUCCESS',
          authcode: '123456',
          avsresponse: 'N',
          cvvresponse: '',
          orderid: '',
          type: 'sale',
          response_code: '100'
        });

      });

    });

});
