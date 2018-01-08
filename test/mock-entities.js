'use strict';
const _ = require('underscore');
const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const creditcardgenerator = require('creditcard-generator');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

class MockEntities {

  static getValidMessage(id){

    id = (!_.isUndefined(id) && !_.isNull(id))?id:uuidV4();

    return {
      MessageId:"someMessageID",
      ReceiptHandle:"SomeReceiptHandle",
      Body: JSON.stringify({id:id}),
      MD5OfBody:"SomeMD5"
    };

  }

  static getValidMerchantProvider(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id: id,
  		account:this.getTestAccountID(),
  		name:randomutilities.createRandomString(20),
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
  		created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidAccessKey(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id:id,
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

  static getValidTransactionProduct(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;
    return {
      product: id,
      amount: randomutilities.randomDouble(1.0, 300.0, 2)
    };
  }

  static getValidCustomer(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    let firstname = randomutilities.createRandomName('first');
    let lastname = randomutilities.createRandomName('last');
    let email = firstname+'.'+lastname+'@'+randomutilities.createDomainName();

    let customer = {
      id:id,
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

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id:id,
      name:randomutilities.createRandomString(20),
      sku:randomutilities.createRandomString(20),
      ship:randomutilities.randomBoolean(),
      shipping_delay:randomutilities.randomInt(60,9999999),
      fulfillment_provider:uuidV4(),
      default_price:randomutilities.randomDouble(1.0, 300.0, 2),
      account:this.getTestAccountID(),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }


  static getTestAccountID(){
    return "d3fa3bf3-7824-49f4-8261-87674482bf1c";
  }

  static getValidFulfillmentProvider(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id:id,
  		account: this.getTestAccountID(),
      name: randomutilities.createRandomString(20),
  		provider:{
        name:"Hashtag",
        username: randomutilities.createRandomString(10),
    		password: randomutilities.createRandomString(10),
        threepl_key:'{'+uuidV4()+'}',
        threepl_customer_id: randomutilities.randomInt(1,9999999)
      },
  		created_at: timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };

  }

  static getValidShippingReceipt(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id:id,
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

  static getValidTransaction(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id: id,
      amount: 14.99,
      alias:"T"+randomutilities.createRandomString(9),
      account: this.getTestAccountID(),
      rebill: uuidV4(),
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894419\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: uuidV4(),
      products:[{
        product:uuidV4(),
        amount:14.99,
        shipping_receipt: uuidV4()
      }],
      type:"sale",
      result:"success",
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidRebill(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      bill_at: timestamp.getISO8601(),
      id: id,
      account: this.getTestAccountID(),
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      amount: randomutilities.randomDouble(1, 200, 2),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidSession(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id: id,
      account:this.getTestAccountID(),
      customer: uuidV4(),
      campaign:uuidV4(),
      product_schedules:[uuidV4(),uuidV4()],
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

  static getValidTransactionCreditCard(name, address, type){

    let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

    type = (!_.isUndefined(type) && !_.isNull(type) && _.contains(creditcard_types, type))?type:randomutilities.selectRandomFromArray(creditcard_types);

    name = (!_.isUndefined(name) && !_.isNull(name))?name:randomutilities.creatRandomName('full');

    address = (!_.isUndefined(address) && !_.isNull(address))?address:this.createAddress();

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

}

module.exports = MockEntities;
