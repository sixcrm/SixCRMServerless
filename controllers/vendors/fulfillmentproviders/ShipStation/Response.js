'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class ShipStationResponse extends FulfillmentProviderVendorResponse {

  constructor({vendor_response, action, additional_parameters}){

    super(arguments[0]);

  }

}
