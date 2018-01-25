'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const ThreePLResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/Response.js');

module.exports = class HashtagResponse extends ThreePLResponse {

  constructor({vendor_response, action, additional_parameters}){

    super(arguments[0]);

  }

}
