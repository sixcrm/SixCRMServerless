'use strict';
const _ = require('underscore');
const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

class MockEntities {

  static getValidTransactionProduct(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;
    return {
      product: id,
      amount: randomutilities.randomDouble(1.0, 300.0, 2)
    };
  }

  static getValidCustomer(id){

    id = (_.isUndefined(id) || _.isNull(id))?uuidV4():id;

    return {
      id:id,
      account:this.getTestAccountID(),
      email: "rama@damunaste.org",
      firstname: "Rama",
      lastname: "Damunaste",
      phone: "1234567890",
      address:{
        line1:"10 Downing St.",
        city:"London",
        state:"OR",
        zip:"97213",
        country:"US"
      },
      creditcards:[uuidV4()],
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }

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

  static getValidFulfillmentProvider(){

    return {
      id:uuidV4(),
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

  static getValidShippingReceipt(){

    return {
      id:uuidV4(),
  		account: this.getTestAccountID(),
  		trackingnumber: randomutilities.createRandomString(10),
      history:[],
      status:"intransit",
      fulfillment_provider: uuidV4(),
      fulfillment_provider_reference: uuidV4(),
  		created_at: timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };

  }

  static getValidTransaction(){

    return {
      id: uuidV4(),
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

  static getValidRebill(){

    return {
      bill_at: timestamp.getISO8601(),
      id: uuidV4(),
      account: this.getTestAccountID(),
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      amount: randomutilities.randomDouble(1, 200, 2),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

  static getValidSession(){

    return {
      id: uuidV4(),
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

}

module.exports = MockEntities;
