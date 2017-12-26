'use strict';

const jsf = require('json-schema-faker');
const uuidV4 = require('uuid/v4');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = {

  getValidShippingReceipt: () => {
    return {
      id:uuidV4(),
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		trackingnumber: randomutilities.createRandomString(10),
      history:[],
      status:"intransit",
      fulfillment_provider: uuidV4(),
      fulfillment_provider_reference: uuidV4(),
  		created_at: timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };
  },

  getValidTransaction:() => {

    return {
      id: uuidV4(),
      amount: 14.99,
      alias:"T"+randomutilities.createRandomString(9),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
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

  },

  getValidRebill: () => {

    return {
      bill_at: timestamp.getISO8601(),
      id: uuidV4(),
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      amount: randomutilities.randomDouble(1, 200, 2),
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    };

  }

}
