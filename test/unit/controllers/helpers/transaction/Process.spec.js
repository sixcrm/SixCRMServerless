'use strict'

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

let expect = chai.expect;
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');

function getValidAmount(){
  return 12.99;
}

function getValidMerchantProviderSummaries(){
  return [
    {
      merchantprovider:{
        id: '6c40761d-8919-4ad6-884d-6a46a776cfb9'
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
      }
    },{
      merchantprovider:{
        id: '79189a4a-ed89-4742-aa96-afcd7f6c08fb'
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
      }
    }
  ];
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
  			password:"password"
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

      //Technical Debt:  This is bad.
      process.env.stage = 'development';

      let ph = new processHelperController();


      loadbalancer.monthly_sum = 4000.00;
      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', 40.00);
      ph.parameters.set('selected_creditcard',creditcard);

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
      let amount = getValidAmount();
      let productschedule = getValidProductSchedule();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      creditcard.properties = creditcard_properties;

      let product_schedule = {};

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), {
        getLoadBalancer: (product_schedule) => {
          return Promise.resolve(loadbalancer);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'LoadBalancer.js'), {
        getMerchantProviders: (loadbalancer) => {
          return Promise.resolve(merchantproviders);
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), {
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve({merchantproviders: merchantprovider_summaries});
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let ph = new processHelperController();

      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);
      ph.parameters.set('productschedule', productschedule);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].enabled = false;
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].accepted_payment_methods = ["Monopoly Money"];
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].summary.summary.thismonth.amount = 52000.00;
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].summary.summary.today.count = 30;
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].summary.summary.thisweek.count = 120;
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[0].summary.summary.thismonth.count = 628;
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];
      loadbalancer.monthly_sum = 4000.00;

      creditcard.properties = creditcard_properties;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('selected_creditcard', creditcard);

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
        expect(error.message).to.equal('[500] Missing source object field: "customer".');
      };

      parameters = {
        customer: ''
      }

      try{
        ph.setParameters(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Missing source object field: "productschedule".');
      };

      parameters = {
        customer: '',
        productschedule: ''
      };

      try{
        ph.setParameters(parameters);
      }catch(error){
        expect(error.message).to.equal('[500] Missing source object field: "amount".');
      };

    });

    it('fails when required parameters are not correct', () => {

       let ph = new processHelperController();

       let parameters = {
         customer: '',
         productschedule: '',
         amount: ''
       };

       try{

         ph.setParameters(parameters);

       }catch(e){

         expect(e.message).to.equal('[500] One or more validation errors occurred.');

       }

       let customer = getValidCustomer();

       parameters = {
         customer: customer.id,
         productschedule: '',
         amount: ''
       };

       try{

         ph.setParameters(parameters);

       }catch(e){

         expect(e.message).to.equal('[500] One or more validation errors occurred.');

       }

       let productschedule = getValidProductSchedule();

       parameters = {
         customer: customer.id,
         productschedule: productschedule.id,
         amount: ''
       };

       try{

         ph.setParameters(parameters);

       }catch(e){

         expect(e.message).to.equal('[500] One or more validation errors occurred.');

       }

     });

   it('succeeds when required parameters are present', () => {

      let ph = new processHelperController();

      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();
      let amount = getValidAmount();
      let parameters = {
        customer: customer.id,
        productschedule: productschedule.id,
        amount: amount
      };

      ph.setParameters(parameters);

      expect(ph.parameters.get('customer')).to.equal(parameters.customer);
      expect(ph.parameters.get('productschedule')).to.equal(parameters.productschedule);
      expect(ph.parameters.get('amount')).to.equal(parameters.amount);

    });

   it('sets optional parameters', () => {

      let ph = new processHelperController();
      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();
      let amount = getValidAmount();
      let merchantprovider = getValidMerchantProviders().pop();
      let parameters = {
        customer: customer.id,
        productschedule: productschedule.id,
        amount: amount,
        merchantprovider: merchantprovider.id
      };

      ph.setParameters(parameters);

      expect(ph.parameters.get('merchantprovider')).to.equal(parameters.merchantprovider);

    });

   it('does not set non-whitelisted optional parameters', () => {

      let ph = new processHelperController();
      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();
      let amount = getValidAmount();
      let merchantprovider = getValidMerchantProviders().pop();
      let parameters = {
        customer: customer.id,
        productschedule: productschedule.id,
        amount: amount,
        merchantprovider: merchantprovider.id,
        somethingelse:'abc123'
      };

      ph.setParameters(parameters);

      try{
        ph.parameters.get('somethingelse')
      }catch(e){
        expect(e.message).to.equal('[500] "somethingelse" property is not set.');
      }

    });

   it('successfully hydrates customers', () => {

      let customer = getValidCustomer();
      let productschedule = getValidProductSchedule();
      let amount = getValidAmount();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index) => {
          if(parameters.expression_attribute_values[':primary_keyv'] == customer.id){
            return Promise.resolve({Items:[customer]});
          }else{
            return Promise.resolve({Items:[productschedule]});
          }

        }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: customer.id,
        productschedule: productschedule.id,
        amount: amount,
        merchantprovider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      };

      ph.setParameters(parameters);

      return ph.hydrateParameters().then(() => {

        expect(ph.parameters.get('customer')).to.equal(customer);

      });

    });

   it('successfully hydrates product schedules', () => {

      let productschedule = getValidProductSchedule();
      let customer = getValidCustomer();
      let amount = getValidAmount();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index) => {
          if(parameters.expression_attribute_values[':primary_keyv'] == customer.id){
            return Promise.resolve({Items:[customer]});
          }else{
            return Promise.resolve({Items:[productschedule]});
          }
        }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: customer.id,
        productschedule: productschedule.id,
        amount: amount,
        merchantprovider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      };

      ph.setParameters(parameters);

      return ph.hydrateParameters().then(() => {

        expect(ph.parameters.get('productschedule')).to.equal(productschedule);

      });

    });


  it('fails when customer is missing a credit card', () => {

    let ph = new processHelperController();

    let customer = getValidCustomer();

    customer.creditcards = [];

    let parameters = {
      customer: customer,
      productschedule: getValidProductSchedule(),
      amount: getValidAmount()
    };

    try{
      ph.setParameters(parameters);
    }catch(error){
      expect(error.message).to.equal('[500] One or more validation errors occurred.');
    };

  });

  it('passes when parameters validate', () => {

    let ph = new processHelperController();

    let parameters = {
      customer: getValidCustomer(),
      productschedule: getValidProductSchedule(),
      amount: getValidAmount()
    };

    ph.setParameters(parameters);

    let validated = ph.validateParameters();

    expect(validated).to.equal(true);

  });

  it('hydrates credit cards', () => {

    let credit_card = getValidCreditCard();

    mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
      queryRecords: (table, parameters, index) => {
        return Promise.resolve({Items:[credit_card]});
      }
    });

    let ph = new processHelperController();

    let parameters = {
      customer: getValidCustomer(),
      productschedule: getValidProductSchedule(),
      amount: getValidAmount()
    };

    ph.setParameters(parameters);

    return ph.hydrateCreditCards().then(() => {

      let customer = ph.parameters.get('customer');

      customer.creditcards.forEach((credit_card) => {

        let validated = mvu.validateModel(credit_card, global.SixCRM.routes.path('model','entities/creditcard.json'));

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
        amount: getValidAmount()
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
        amount: getValidAmount()
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
        expect(selected_credit_card).to.equal(cc_1)
      })

    });

   it('selects the first credit card', () => {

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: getValidAmount()
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

      let selected_creditcard = getValidCreditCard();

      ph.parameters.set('selected_creditcard', selected_creditcard);

      return ph.setBINNumber().then(binnumber => {

        expect(binnumber).to.equal(ph.parameters.get('selected_creditcard').bin.substring(0, 6));

      });

    });

   it('retrieves selected credit card properties', () => {

      let cc_properties= getValidCreditCardProperties();

      mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), {
          getBINList: (parameters) => {
              return Promise.resolve({bins:[cc_properties], pagination: {}});
          }
      });

      let ph = new processHelperController();

      let selected_creditcard = getValidCreditCard();

      ph.parameters.set('selected_creditcard', selected_creditcard);

      ph.setBINNumber();

      return ph.getSelectedCreditCardProperties().then(selected_credit_card_properties => {

        expect(ph.parameters.get('selected_creditcard').properties).to.equal(cc_properties);

      });

    });

   it('retrieves the loadbalancer', () => {

      let lb_1 = getValidLoadBalancer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), {
          getLoadBalancer: (product_schedule) => {
              return Promise.resolve(lb_1);
          }
      });

      let ph = new processHelperController();

      let parameters = {
        customer: getValidCustomer(),
        productschedule: getValidProductSchedule(),
        amount: getValidAmount()
      };

      let cc_1 = getValidCreditCard();

      parameters.customer.creditcards = [cc_1];
      parameters.productschedule.loadbalancer = lb_1;

      ph.setParameters(parameters);

      return ph.getLoadBalancer().then(loadbalancer => {

        expect(loadbalancer).to.deep.equal(lb_1);
        expect(ph.parameters.get('selected_loadbalancer')).to.deep.equal(lb_1);

      });

    });

   it('retrieves merchant providers', () => {

      let merchantproviders = getValidMerchantProviders();
      let lb_1 = getValidLoadBalancer();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'LoadBalancer.js'), {
        getMerchantProviders:(loadbalancer) => {
            ph.parameters.set('merchantproviders', merchantproviders);
            return Promise.resolve(merchantproviders);
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', lb_1);

      return ph.getMerchantProviders().then(result => {

        expect(result).to.equal(merchantproviders);
        expect(ph.parameters.get('merchantproviders')).to.equal(merchantproviders);

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
      let creditcard = getValidCreditCard();

      creditcard.properties = getValidCreditCardProperties();

      merchantproviders[0].allowed_payment_methods = ['Visa','Mastercard'];
      merchantproviders[1].allowed_payment_methods = ['Visa', 'American Express'];

      let ph = new processHelperController();

      ph.parameters.set('selected_creditcard', creditcard);

      return ph.filterTypeMismatchedMerchantProviders(merchantproviders).then(filtered_merchantproviders => {

        expect(filtered_merchantproviders).to.deep.equal(merchantproviders);

      });

    });

   it('filter type mismatched merchant provider', () => {

      let merchantproviders = getValidMerchantProviders();
      let creditcard =  getValidCreditCard();
      let creditcard_properties = getValidCreditCardProperties();

      creditcard.properties = creditcard_properties;
      creditcard.properties.brand = 'American Express';
      merchantproviders[0].accepted_payment_methods = ['Visa','Mastercard'];
      merchantproviders[1].accepted_payment_methods = ['Visa', 'American Express'];

      let ph = new processHelperController();

      ph.parameters.set('selected_creditcard',  creditcard);

      return ph.filterTypeMismatchedMerchantProviders(merchantproviders).then(filtered_merchantproviders => {

        expect(filtered_merchantproviders).to.deep.equal([merchantproviders[1]]);

      });

    });

   it('gets merchant provider summaries', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'analytics/Analytics.js'), {
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve({merchantproviders: merchantprovider_summaries});
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      let ph = new processHelperController();

      ph.parameters.set('merchantproviders', merchantproviders);

      return ph.getMerchantProviderSummaries().then(results => {

        expect(results).to.deep.equal({merchantproviders: merchantprovider_summaries});

      });

    });

   it('marries merchant provider list merchant provider summaries', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      let ph = new processHelperController();

      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('merchantprovider_summaries', merchantprovider_summaries);

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      return ph.marryMerchantProviderSummaries().then(() => {

        expect(ph.parameters.get('merchantproviders')).to.deep.equal(merchantproviders);

      });

    });

   it('should not filter merchant provider list by model validation', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('merchantproviders', merchantproviders);

      return ph.filterInvalidMerchantProviders(ph.parameters.get('merchantproviders')).then(results => {
        expect(results).to.deep.equal(ph.parameters.get('merchantproviders'));
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
      let amount = getValidAmount();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);

      return ph.filterCAPShortageMerchantProviders(ph.parameters.get('merchantproviders')).then(results => {

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

      ph.parameters.set('merchantproviders',merchantproviders);
      ph.parameters.set('selected_loadbalancer', loadbalancer);

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

      ph.parameters.set('merchantproviders', merchantproviders);

      try{
        ph.calculateLoadBalancerSum();
      }catch(error){
          expect(error.message).to.equal('[500] "selected_loadbalancer" property is not set.');
      }

    });

   it('should get a merchant provider target distribution', () => {

      let loadbalancer = getValidLoadBalancer();

      let merchantproviders = getValidMerchantProviders();

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);

      return ph.getMerchantProviderTargetDistribution(merchantproviders[1]).then((target_distribution) => {
        expect(target_distribution).to.equal(loadbalancer.merchantproviders[1].distribution);
      });

    });

   it('should get a merchant provider actual distribution', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('amount', 100.00);

      let expected_percentage = (mathutilities.safePercentage(3000, (4000+100), 8))/100;

      let hypothetical_distribution = ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1]);

      expect(hypothetical_distribution).to.equal(expected_percentage);

    });

   it('should get a merchant provider actual distribution with additional amount', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('amount', 100.00);

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      let base_distribution = ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], 100);

      expect(base_distribution).to.equal(expected_percentage);

    });

   it('fails to get merchant provider actual distribution due to missing amount property', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      try {

          ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], 100);

      }catch(error){

        expect(error.message).to.equal('[500] "amount" property is not set.');

      }

    });

   it('fails to get a merchant provider actual distribution due to incorrect amount property type', () => {

      let ph = new processHelperController();

      try{
        ph.parameters.set('amount', '100');
      }catch(error){
        expect(error.message).to.equal('[500] One or more validation errors occurred.');
      }

    });

   it('fails to get a merchant provider actual distribution because additional amount is incorrectly typed', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;
      let amount = getValidAmount();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[1].summary = merchantprovider_summaries[1];
      merchantproviders[1].summary.summary.thismonth.amount = 3000.00;

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer', loadbalancer);
      ph.parameters.set('amount', amount);

      let expected_percentage = (mathutilities.safePercentage((3000 + 100), (4000+100), 8))/100;

      try{
        ph.getMerchantProviderHypotheticalBaseDistribution(merchantproviders[1], '100')
      }catch(error){
        expect(error.message).to.equal('[500] Process.getMerchantProviderDistribution assumes that additional_amount argument is numeric');
      }

    });

   it('fails to select a merchant provider by Least Sum of Squares goal analysis because amount is not set', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;
      let amount = getValidAmount();
      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer',loadbalancer);
      ph.parameters.set('merchantproviders',merchantproviders);

      try{
        ph.selectMerchantProviderFromLSS()
      }catch(error){
        expect(error.message).to.equal('[500] "hypothetical_distribution_base_array" property is not set.');
      }

    });

   it('selects a merchant provider by Least Sum of Squares goal analysis', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;
      let amount = getValidAmount();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer',loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('target_distribution_array',[0.75, 0.25]);
      ph.parameters.set('hypothetical_distribution_base_array', [0.84, 0.16]);

      return ph.selectMerchantProviderFromLSS().then(result => {

        expect(result).to.equal(merchantproviders[1]);

      });

    });

   it('selects a different merchant provider by Least Sum of Squares goal analysis', () => {

      let loadbalancer = getValidLoadBalancer();

      loadbalancer.monthly_sum = 4000.00;
      let amount = getValidAmount();

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('selected_loadbalancer',loadbalancer);
      ph.parameters.set('merchantproviders', merchantproviders);
      ph.parameters.set('amount', amount);
      ph.parameters.set('target_distribution_array',[0.75, 0.25]);
      ph.parameters.set('hypothetical_distribution_base_array', [0.1, 0.9]);

      return ph.selectMerchantProviderFromLSS().then(result => {

        expect(result).to.equal(merchantproviders[0]);

      });

    });

   it('instantiates a processor class ', () => {

      let merchantproviders = getValidMerchantProviders();
      let merchantprovider_summaries = getValidMerchantProviderSummaries();

      merchantproviders[0].summary = merchantprovider_summaries[0];
      merchantproviders[1].summary = merchantprovider_summaries[1];

      let ph = new processHelperController();

      ph.parameters.set('selected_merchantprovider', merchantproviders[0]);

      return ph.instantiateGateway().then(response => {

        expect((ph.parameters.get('instantiated_gateway').constructor.name)).to.equal('NMIController');

      });

    });

   it('creates the processor parameters object', () => {

      let customer = getValidCustomer();
      let creditcard = getValidCreditCard();
      let amount = getValidAmount();
      let ph = new processHelperController();

      ph.parameters.set('customer',customer);
      ph.parameters.set('selected_creditcard', creditcard);
      ph.parameters.set('amount', amount);

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
      let amount = getValidAmount();

      let parameters = {
        customer: customer,
        productschedule: productschedule,
        amount: amount
      };

      let cc_properties= getValidCreditCardProperties();

      mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), {
        getBINList: (parameters) => {
          return Promise.resolve({bins:[cc_properties], pagination: {}});
        },
        getMerchantProviderSummaries: (parameters) => {
          return Promise.resolve({merchantproviders: merchantprovider_summaries});
        },
        disableACLs: () => {},
        enableACLs: () => {}
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), {
        get:({id: creditcard_id}) => {
          let creditcard = arrayutilities.find(creditcards, (a_creditcard) => {
            if(a_creditcard.id == creditcard_id){ return true; }
            return false;
          })

          return Promise.resolve(creditcard);
        },
        getID:(object) => {
          return object;
        },
        disableACLs: () => {},
        enableACLs: () => {},
        getBINNumber: (creditcard_number) => { return creditcard_number.slice(0, 6); }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), {
        getLoadBalancer: (product_schedule) => {
          return Promise.resolve(loadbalancer);
        },
        getID:(object) => {
          return object;
        },
        get:({id: id}) => {
          return Promise.resolve(productschedule);
        },
        disableACLs: () => {},
        enableACLs: () => {},
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), {
        getID:(object) => {
          return object;
        },
        get:({id: id}) => {
          return Promise.resolve(customer);
        },
        disableACLs: () => {},
        enableACLs: () => {},
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'LoadBalancer.js'), {
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
            code:'success',
            message: 'SUCCESS',
            result:{
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

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/NMI.js'), mock_nmi_class);

      let ph = new processHelperController();

      return ph.process(parameters).then((response) => {

        expect(response.code).to.equal('success');
        expect(response.message).to.equal('SUCCESS');
        expect(response.merchant_provider).to.equal(merchantproviders[1].id);
        expect(response.result).to.include({
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
