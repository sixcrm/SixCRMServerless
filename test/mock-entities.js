'use strict';
const _ = require('underscore');
const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const creditcardgenerator = require('creditcard-generator');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

class MockEntities {

  static getValidId(id) {
    return (!_.isUndefined(id) && !_.isNull(id)) ? id : uuidV4();
  }

  static getValidSchedule(ids, expanded){

    expanded = (_.isUndefined(expanded) || _.isNull(expanded))?false:expanded;

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(),uuidV4(),uuidV4(),uuidV4()]:ids;

    let start = 0;

    return arrayutilities.map(ids, (id, index) => {

      let this_start = start;
      let period = randomutilities.randomInt(1, 60);
      let end = (start + period);

      start = (this_start + period);

      return {
        product: this.getValidProduct(id, true),
        price:randomutilities.randomDouble(1.00, 100.00, 2),
        start:this_start,
        end:end,
        period: period
      }

    });

  }

  static getValidProductScheduleGroups(ids, expanded){

    expanded = (_.isUndefined(expanded) || _.isNull(expanded))?false:expanded;

    let product_schedules = this.getValidProductSchedules(ids);

    return arrayutilities.map(product_schedules, product_schedule => {
      return {
        quantity: randomutilities.randomInt(1,10),
        product_schedule: (expanded)?product_schedule:product_schedule.id
      }
    });

  }

  static getValidTransactionProducts(ids, expanded){

    expanded = (_.isUndefined(expanded) || _.isNull(expanded))?false:expanded;

    let products = this.getValidProducts(ids);

    return arrayutilities.map(products, product => {
      return {
        quantity: randomutilities.randomInt(1,10),
        product: (expanded)?product:product.id,
        amount: randomutilities.randomDouble(1.00, 100.00)
      }
    });

  }

  static getValidProductSchedules(ids, expanded){

    expanded = (_.isUndefined(expanded) || _.isNull(expanded))?false:expanded;

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(),uuidV4(),uuidV4(),uuidV4()]:ids;

    return arrayutilities.map(ids, (id, index) => {
      return this.getValidProductSchedule(id, expanded);
    });

  }

  static getValidProducts(ids){

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(),uuidV4(),uuidV4(),uuidV4()]:ids;

    return arrayutilities.map(ids, (id, index) => {
      return this.getValidProduct(id);
    });

  }

  static getValidProductSchedule(id, expanded){

    expanded = (_.isUndefined(expanded) || _.isNull(expanded))?false:expanded;

    let schedule = this.getValidSchedule(null, expanded);

    return  {
      id: this.getValidId(id),
      name: randomutilities.createRandomString(20),
      account: this.getTestAccountID(),
      loadbalancer: uuidV4(),
      schedule: schedule,
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    };

  }

  static getValidMessage(id){

    return {
      MessageId:"someMessageID",
      ReceiptHandle:"SomeReceiptHandle",
      Body: JSON.stringify({id: this.getValidId(id)}),
      MD5OfBody:"SomeMD5"
    };

  }

  static getValidMerchantProviderGateway(processor){

    processor = (_.isUndefined(processor) || _.isNull(processor))?'NMI':processor;

    let gateways = {
      'NMI': {
        name:"NMI",
        username:randomutilities.createRandomString(20),
        password:randomutilities.createRandomString(20),
        processor_id:randomutilities.randomInt(1,100).toString()
      },
      'Innovio':{
        name: 'Innovio',
        username:randomutilities.createRandomString(20),
        password:randomutilities.createRandomString(20),
        site_id: '0',
        merchant_account_id: '100',
        product_id: '1001'
      },
      'Test':{
        name: 'Test',
        username:'demo',
        password:'password',
        processor_id:'0'
      },
      'Stripe':{
        name: 'Stripe',
        api_key: randomutilities.createRandomString(20)
      }
    };

    return gateways[processor];

  }

  static getValidMerchantProviderProcessor(processor){

    processor = (_.isUndefined(processor) || _.isNull(processor))?'NMI':processor;

    let processors = {
      'NMI': {
        name: 'NMA',
        id: 'deprecated?'
      },
      'Innovio':{
        name: 'Humbolt',
        id: 'deprecated?'
      },
      'Test':{
        name: 'Test',
        id: 'deprecated?'
      },
      'Stripe':{
        name: 'Stripe',
        id: 'deprecated?'
      }
    };

    return processors[processor];

  }

  static getValidMerchantProviderGroups(ids){

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4()]:ids;

    let return_object = {};

    arrayutilities.map(ids, id => {
      return_object[id] = this.getValidTransactionProducts();
    });

    return return_object;

  }

  static getValidMerchantProvider(id, processor){

    return {
      id: this.getValidId(id),
  		account:this.getTestAccountID(),
  		name:randomutilities.createRandomString(20),
  		processor:this.getValidMerchantProviderProcessor(processor),
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
  		gateway: this.getValidMerchantProviderGateway(processor),
  		allow_prepaid:true,
  		accepted_payment_methods:["Visa", "Mastercard", "American Express"],
  		customer_service:{
  			email:"customer.service@mid.com",
  			url:"http://mid.com",
  			description:randomutilities.createRandomString(20)
  		},
  		created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidAccessKey(id){

    return {
      id: this.getValidId(id),
      account:this.getTestAccountID(),
      name:randomutilities.createRandomString(10),
      notes: 'This is a mock access key.',
      access_key: this.getValidAccessKeyString(),
      secret_key: this.getValidSecretKeyString(),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }

  }

  static getValidAccessKeyString(){

    let accessKeyHelperController = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

    return accessKeyHelperController.generateAccessKey();

  }

  static getValidSecretKeyString(){

    let accessKeyHelperController = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

    return accessKeyHelperController.generateSecretKey();

  }

  static getValidTrackingNumber(vendor){

    let vendor_tracking_numbers = {
      'Test':() => randomutilities.createRandomString(20)
    }

    return vendor_tracking_numbers[vendor]();

  }

  static getValidTransactionProduct(id, extended){

    extended = (_.isUndefined(extended) || _.isNull(extended))?false:extended;
    let product = (extended)?this.getValidId(id):this.getValidProduct(id);

    return {
      product: product,
      amount: randomutilities.randomDouble(1.0, 300.0, 2),
      quantity: 1
    };

  }

  static getValidCustomer(id){

    let firstname = randomutilities.createRandomName('first');
    let lastname = randomutilities.createRandomName('last');
    let email = firstname+'.'+lastname+'@'+randomutilities.createDomainName();

    let customer = {
      id: this.getValidId(id),
      account:this.getTestAccountID(),
      email: email,
      firstname: firstname,
      lastname: lastname,
      phone: randomutilities.createRandomPhoneNumber(),
      address:{
        line1:randomutilities.createRandomAddress('line1'),
        city:randomutilities.createRandomAddress('city'),
        state:randomutilities.createRandomAddress('state'),
        zip:randomutilities.createRandomAddress('zip'),
        country:randomutilities.createRandomAddress('country')
      },
      creditcards:[uuidV4()],
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }

    if(randomutilities.randomBoolean()){
      customer.address.line2 = randomutilities.createRandomAddress('line2');
    }

    return customer;

  }

  static getValidProduct(id){

    return {
      id: this.getValidId(id),
      name:randomutilities.createRandomString(20),
      sku:randomutilities.createRandomString(20),
      ship:randomutilities.randomBoolean(),
      shipping_delay:randomutilities.randomInt(60,9999999),
      fulfillment_provider:uuidV4(),
      default_price:randomutilities.randomDouble(1.0, 300.0, 2),
      attributes:{
        images:[{
          path:randomutilities.createURL(),
          dimensions:{
            width:randomutilities.randomInt(10,1000),
            height:randomutilities.randomInt(10,1000)
          },
          format:'jpg',
          name:randomutilities.createRandomString(randomutilities.randomInt(10, 40)),
          description:randomutilities.createRandomString(randomutilities.randomInt(10, 300)),
          default_image:randomutilities.randomBoolean()
        }],
        weight:{
          unitofmeasurement: 'kilos',
          units: 100
        },
        dimensions:{
          height:{
            unitofmeasurement: 'centimeters',
            units: randomutilities.randomInt(1,100)
          },
          width:{
            unitofmeasurement: 'centimeters',
            units: randomutilities.randomInt(1,100)
          },
          length:{
            unitofmeasurement: 'centimeters',
            units: randomutilities.randomInt(1,100)
          }
        }
      },
      account:this.getTestAccountID(),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }


  static getTestAccountID(){
    return "d3fa3bf3-7824-49f4-8261-87674482bf1c";
  }

  static getValidFulfillmentProviderProvider(type){

    let providers = {
      Hashtag: {
        name: 'Hashtag',
        username: randomutilities.createRandomString(20),
        password: randomutilities.createRandomString(20),
        threepl_customer_id: randomutilities.randomInt(),
        threepl_key: '{'+uuidV4()+'}'
      },
      ThreePL:{
        name: 'ThreePL',
        username: randomutilities.createRandomString(20),
        password: randomutilities.createRandomString(20),
        threepl_customer_id: randomutilities.randomInt(),
        threepl_key: '{'+uuidV4()+'}',
        threepl_id: randomutilities.randomInt(),
        threepl_facility_id: randomutilities.randomInt()
      },
      Test: {
        name: 'Test'
      },
      ShipStation:{
        name: 'ShipStation',
        api_key: randomutilities.createRandomString(20),
        api_secret: randomutilities.createRandomString(20)
      }
    };

    return providers[type];

  }

  static getValidFulfillmentProvider(id, type){

    type = (_.isUndefined(type) || !_.contains(['ShipStation', 'Hashtag', 'ThreePL', 'Test'], type))?'Hashtag':type;

    let provider = this.getValidFulfillmentProviderProvider(type);

    return {
      id: this.getValidId(id),
  		account: this.getTestAccountID(),
      name: randomutilities.createRandomString(20),
  		provider: provider,
  		created_at: timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };

  }

  static getValidShippingReceipt(id){

    return {
        id: this.getValidId(id),
  		account: this.getTestAccountID(),
      tracking:{
        carrier: 'UPS',
        id: randomutilities.createRandomString(10)
      },
      history:[],
      status:"intransit",
      fulfillment_provider: uuidV4(),
      fulfillment_provider_reference: uuidV4(),
  		created_at: timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };

  }

  static getValidTransactions(ids){

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(),uuidV4(),uuidV4(),uuidV4()]:ids;

    return arrayutilities.map(ids, (id, index) => {
      return this.getValidTransaction(id);
    });

  }

  static getValidTransaction(id, extended){

    let products = this.getValidTransactionProducts();

    return {
      id: this.getValidId(id),
      amount: 14.99,
      alias:"T"+randomutilities.createRandomString(9),
      account: this.getTestAccountID(),
      rebill: uuidV4(),
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894419\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: uuidV4(),
      products:this.getValidTransactionProducts(null, true),
      type:"sale",
      result:"success",
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidRebill(id){

    return {
      bill_at: timestamp.getISO8601(),
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      products: this.getValidTransactionProducts(null, true),
      amount: randomutilities.randomDouble(1, 200, 2),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidSessionAlias(){
    return 'S'+randomutilities.createRandomString(9);
  }

  static getValidSession(id){

    let product_schedules = this.getValidProductSchedules();

    return {
      id: this.getValidId(id),
      account:this.getTestAccountID(),
      alias: this.getValidSessionAlias(),
      customer: uuidV4(),
      campaign:uuidV4(),
      product_schedules: arrayutilities.map(product_schedules, (product_schedule) => product_schedule.id),
      watermark: this.getValidWatermark(product_schedules),
      completed: randomutilities.randomBoolean(),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601(),
      affiliate:	uuidV4(),
      subaffiliate_1:	uuidV4(),
      subaffiliate_2:	uuidV4(),
      subaffiliate_3:	uuidV4(),
      subaffiliate_4:	uuidV4(),
      subaffiliate_5:	uuidV4(),
      cid:uuidV4()
    };

  }

  static getValidWatermark(product_schedules, products){

    let return_object = {};

    if(arrayutilities.nonEmpty(product_schedules)){

      return_object.product_schedules = arrayutilities.map(product_schedules, product_schedule => {
        return this.getValidProductScheduleGroup(product_schedule);
      });

    }

    if(arrayutilities.nonEmpty(products)){

      return_object.products = arrayutilities.map(products, product => {
        return this.getValidProductGroup(product);
      });

    }

    return return_object;

  }

  static getValidProductScheduleGroup(product_schedule, quantity){

    product_schedule = (_.isUndefined(product_schedule) || _.isNull(product_schedule))?this.getValidProductSchedule():product_schedule;
    quantity = (_.isUndefined(quantity) || _.isNull(quantity))?randomutilities.randomInt(1,10):quantity;

    return {
      product_schedule: product_schedule,
      quantity: quantity
    };

  }

  static getValidProductGroup(product, quantity, price){

    product = (_.isUndefined(product) || _.isNull(product))?this.getValidProduct():product;
    price = (_.isUndefined(price) || _.isNull(price))?randomutilities.randomDouble(1.0,100.00):price;
    quantity = (_.isUndefined(quantity) || _.isNull(quantity))?randomutilities.randomInt(1,10):quantity;

    return {
      product: product,
      quantity: quantity,
      price: price
    };

  }

  static getValidTransactionCustomer(){

    let phone = randomutilities.createRandomPhoneNumber();
    let firstname = randomutilities.createRandomName('first');
    let lastname = randomutilities.createRandomName('last');
    let email = firstname+'.'+lastname+'@'+randomutilities.createDomainName();
    let address = this.getValidAddress();

    return {
      email: email,
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      address: address,
      billing: address
    };

  }

  static getValidAddress(){

    let address = {
      line1:randomutilities.createRandomAddress('line1'),
      city:randomutilities.createRandomAddress('city'),
      state:randomutilities.createRandomAddress('state'),
      zip:randomutilities.createRandomAddress('zip'),
      //country:randomutilities.createRandomAddress('country')
      country:'US'
    };

    if(randomutilities.randomBoolean()){
      address.line2 = randomutilities.createRandomAddress('line2');
    }

    return address;

  }

  static getValidCreditCardProperties(){

      return {
        binnumber: 411111,
        brand: 'Visa',
        bank: 'Some Bank',
        type: 'Classic',
        level: 'level',
        country: 'US',
        info: '',
        country_iso: 'USA',
        country2_iso: 'USA',
        country3_iso: 'USA',
        webpage: 'www.bankofamerica.com',
        phone: '15032423612'
      };

  }

  static getValidTransactionCreditCard(name, address, type){

    let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

    type = (!_.isUndefined(type) && !_.isNull(type) && _.contains(creditcard_types, type))?type:randomutilities.selectRandomFromArray(creditcard_types);

    name = (!_.isUndefined(name) && !_.isNull(name))?name:randomutilities.createRandomName('full');

    address = (!_.isUndefined(address) && !_.isNull(address))?address:this.getValidAddress();

    return {
      name: name,
      number: this.getValidCreditCardNumber(type),
      expiration:this.getValidCreditCardExpiration(),
      ccv: this.getValidCreditCardCCV(type),
      address: address
    };

  }

  static getValidCreditCardNumber(type){

    du.debug('Get Valid CreditCard Numbers');

    let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

    type = (!_.isUndefined(type) && !_.isNull(type) && _.contains(creditcard_types, type))?type:randomutilities.selectRandomFromArray(creditcard_types);

    return creditcardgenerator.GenCC(type).shift();

  }

  static getValidCreditCardExpiration(){

    du.debug('Get Valid CreditCard Expiration');

    let expiration_month = randomutilities.randomInt(1,12).toString();

    if(expiration_month.length == 1){
      expiration_month = '0'+expiration_month;
    }

    let current_year = parseInt(timestamp.getYear());

    let expiration_year = randomutilities.randomInt(current_year, (current_year+randomutilities.randomInt(1,5))).toString();

    return expiration_month+'/'+expiration_year;

  }

  static getValidCreditCardCCV(type){

    du.debug('Get Valid CreditCard CCV');

    let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

    type = (!_.isUndefined(type) && !_.isNull(type) && _.contains(creditcard_types, type))?type:randomutilities.selectRandomFromArray(creditcard_types);

    if(type == 'Amex'){

      return randomutilities.randomInt(1001, 9999).toString();

    }

    return randomutilities.randomInt(111, 999).toString();

  }

  static getValidCreditCard(id){

    return {
        id: this.getValidId(id),
        account: this.getTestAccountID(),
        address: this.getValidAddress(),
        number: this.getValidCreditCardNumber(),
        ccv: this.getValidCreditCardCCV(),
        expiration: this.getValidCreditCardExpiration(),
        name: randomutilities.createRandomName('full'),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidCustomerNotes(id) {

    return {
        id: this.getValidId(id),
        account: this.getTestAccountID(),
        customer: uuidV4(),
        user:randomutilities.createRandomEmail(),
        body: randomutilities.createRandomString(20),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidMerchantProviderConfiguration(ids){

    ids = (_.isUndefined(ids) || _.isNull(ids))?[uuidV4(), uuidV4()]:ids;

    return arrayutilities.map(ids, id => {
      return {id: uuidV4(), distribution: randomutilities.randomDouble(0.0, 1.0)};
    });

  }

  static getValidLoadBalancer(id, merchant_provider_configuration) {

    merchant_provider_configuration = (_.isUndefined(merchant_provider_configuration) || _.isNull(merchant_provider_configuration))?this.getValidMerchantProviderConfiguration():merchant_provider_configuration;

    return {
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      name: randomutilities.createRandomName('full'),
      merchantproviders: merchant_provider_configuration,
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    };

  }

  static getValidNotification(id) {

    return {
        id: this.getValidId(id),
        user: randomutilities.createRandomEmail(),
        action: randomutilities.createRandomString(10),
        account: this.getTestAccountID(),
        title: randomutilities.createRandomString(10),
        type: randomutilities.createRandomString(10),
        category: randomutilities.createRandomString(10),
        body: randomutilities.createRandomString(20),
        expires_at: timestamp.getISO8601(),
        read_at: timestamp.getISO8601(),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidUserSigningString(id) {

    return {
        id: this.getValidId(id),
        user: randomutilities.createRandomEmail(),
        name: randomutilities.createRandomName('full'),
        signing_string: randomutilities.createRandomString(20),
        used_at: timestamp.getISO8601(),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidUser(id) {

    id = (_.isUndefined(id) || _.isNull(id)) ? randomutilities.createRandomEmail():id;

    return {
        id: id,
        name: randomutilities.createRandomName('full'),
        first_name: randomutilities.createRandomName('first'),
        last_name: randomutilities.createRandomName('last'),
        auth0_id: randomutilities.createRandomString(10),
        active:randomutilities.randomBoolean(),
        termsandconditions: randomutilities.createRandomString(10),
        alias: randomutilities.createRandomString(40),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidUserACL(id) {

    return {
        id: this.getValidId(id),
        account: this.getTestAccountID(),
        user: randomutilities.createRandomEmail(),
        role: uuidV4(),
        pending: randomutilities.createRandomString(10),
        termsandconditions: randomutilities.createRandomString(10),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidAffiliate(id) {

    return {
        id: this.getValidId(id),
        account: this.getTestAccountID(),
        name: randomutilities.createRandomName('full'),
        affiliate_id: randomutilities.createRandomString(10),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidAccount(id) {

    return {
        id: this.getValidId(id),
        name: randomutilities.createRandomName('full'),
        active: randomutilities.randomBoolean(),
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidRole(id) {

    return {
        id: this.getValidId(id),
        name: randomutilities.createRandomName('full'),
        active: randomutilities.randomBoolean(),
        permissions: {
          allow: [
              randomutilities.createRandomString(10)
          ],
          deny: [
              randomutilities.createRandomString(10)
          ]
        },
        created_at: timestamp.getISO8601(),
        updated_at: timestamp.getISO8601()
    }
  }

  static getValidBill(id) {

    return {
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      paid: randomutilities.randomBoolean(),
      paid_result: randomutilities.createRandomString(10),
      outstanding: randomutilities.randomBoolean(),
      period_start_at: timestamp.getISO8601(),
      period_end_at: timestamp.getISO8601(),
      available_at: timestamp.getISO8601(),
      detail: [{
          created_at: timestamp.getISO8601(),
          description: randomutilities.createRandomString(10),
          amount: randomutilities.randomDouble(1, 200, 2)
      }],
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    }
  }

  static getValidCampaign(id) {

    return {
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      allow_prepaid: randomutilities.randomBoolean(),
      show_prepaid: randomutilities.randomBoolean(),
      name: randomutilities.createRandomName('full'),
      emailtemplates: [uuidV4()],
      affiliate_allow: [uuidV4()],
      affiliate_deny: [uuidV4()],
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    };

  }

  static getValidTracker(id) {

    let tracker_types = ["postback", "html"];

    let event_type = ["click", "lead", "main", "upsell", "confirm"];

    return {
      id: this.getValidId(id),
      affiliates: [uuidV4()],
      campaigns: [uuidV4()],
      account: this.getTestAccountID(),
      type: randomutilities.selectRandomFromArray(tracker_types),
      event_type: [
          randomutilities.selectRandomFromArray(event_type)
      ],
      name: randomutilities.createRandomName('full'),
      body: randomutilities.createRandomString(20),
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    };

  }

  static getValidSMTPProvider(id) {

    let random_hostname = randomutilities.createRandomString(5) + '.' + randomutilities.createDomainName();

    return {
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      name: randomutilities.createRandomName('full'),
      hostname: random_hostname,
      username: randomutilities.createRandomString(10),
      password: randomutilities.createRandomString(10),
      port:randomutilities.randomInt(100,999),
      from_email: randomutilities.createRandomEmail(),
      from_name: randomutilities.createRandomName('full'),
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    }
  }

  static getValidEmailTemplate(id) {

    return {
      id: this.getValidId(id),
      account: this.getTestAccountID(),
      name: randomutilities.createRandomName('full'),
      body: randomutilities.createRandomString(20),
      subject: randomutilities.createRandomString(10),
      type: randomutilities.createRandomString(10),
      smtp_provider: uuidV4(),
      created_at: timestamp.getISO8601(),
      updated_at: timestamp.getISO8601()
    }
  }
}

module.exports = MockEntities;
