'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const xmlutilities = global.SixCRM.routes.include('lib', 'xml-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class ThreePLResponse extends FulfillmentProviderVendorResponse {

  constructor({error, response, body}){

    super(arguments[0]);

  }

  translateResponse(response){

    du.debug('Translate Response');

    if(!stringutilities.nonEmpty(response.body)){ return null; }

    let parsed_response = xmlutilities.parse(response.body);

    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.FindOrders.0._', false)){
      parsed_response = xmlutilities.parse(parsed_response['soap:Envelope']['soap:Body'][0].FindOrders[0]['_']);
    }

    /*
    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.FindOrders.0._', false)){
      parsed_response = xmlutilities.parse(parsed_response['soap:Envelope']['soap:Body'][0].FindOrders[0]['_']);
    }
    */

    return parsed_response;

  }

}
