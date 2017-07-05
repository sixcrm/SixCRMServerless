'use strict'

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

let expect = chai.expect;
let du = global.routes.include('lib', 'debug-utilities.js');
let mvu = global.routes.include('lib', 'model-validator-utilities.js');
let timestamp = global.routes.include('lib', 'timestamp.js');

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
        amount: 0
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
        amount: 0
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
        }
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

    //note:  this is the composite of all the filter functions
    xit('filters merchant provider list', () => {});

    xit('retrieves merchant provider details', () => {});

    xit('filter merchant provider list by least sum of squares goal analysis', () => {});
    xit('process class validates (pre)', () => {});
    xit('process class validates (post)', () => {});
});
