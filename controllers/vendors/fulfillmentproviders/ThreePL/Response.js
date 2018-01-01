'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const xmlutilities = global.SixCRM.routes.include('lib', 'xml-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const FulfillmentProviderVendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class ThreePLResponse extends FulfillmentProviderVendorResponse {

  constructor({vendor_response, action, additional_parameters}){

    super(arguments[0]);

  }

  translateResponse(response){

    du.debug('Translate Response');

    let action = this.parameters.get('action');

    let translation_methods = {
      test:'translateTest',
      info:'translateInfo',
      fulfill:'translateFulfill'
    };

    let translation_method = translation_methods[action];

    return this[translation_methods[action]](response);

  }

  translateInfo(response){

    du.debug('Translate Info');

    if(!stringutilities.nonEmpty(response.body)){ return null; }

    let parsed_response = xmlutilities.parse(response.body);

    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.FindOrders.0._', false)){
      return this.parseFindOrdersResponse(parsed_response);
    }

    //Technical Debt:  Throw Error?
    return parsed_response;

  }

  translateTest(response){

    du.debug('Translate Test');

    if(!stringutilities.nonEmpty(response.body)){
      //Technical Debt:  Throw Error?
      return null;
    }

    let parsed_response = xmlutilities.parse(response.body);

    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.FindOrders.0._', false)){

      return {
        success: true,
        message: 'Successfully validated.'
      };

    }

    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.soap:Fault.0')){

      return {
        success: false,
        message: parsed_response['soap:Envelope']['soap:Body'][0]['soap:Fault'][0].faultstring
      }
    }

    eu.throwError('server', "Unrecognized ThreePL response body: "+response.body);

  }

  translateFulfill(response){

    du.debug('Translate Fulfill');

    if(!stringutilities.nonEmpty(response.body)){ return null; }

    let reference_number = this.acquireReferenceNumber();

    let response_prototype = {
      success: false,
      message: 'Non-specific failure.',
      reference_number:reference_number
    };

    du.info(response.body);

    let parsed_response = xmlutilities.parse(response.body);

    if(objectutilities.hasRecursive(parsed_response, 'soap:Envelope.soap:Body.0.Int32.0._', false)){

      let response = parsed_response['soap:Envelope']['soap:Body'][0].Int32[0]['_'];

      if(response == 1){

        response_prototype.success = true;
        response_prototype.message = 'Success';

      }

    }

    return response_prototype;

  }

  acquireReferenceNumber(fatal){

    du.debug('Acquire Reference Number');

    fatal = _.isUndefined(fatal)?true:fatal;

    let additional_parameters = this.parameters.get('additionalparameters', null, false);

    if(!_.isNull(additional_parameters)){

      if(_.has(additional_parameters, 'reference_number')){

        return additional_parameters.reference_number;

      }else{

        if(fatal){ eu.throwError('server', 'Missing reference_number in vendor response additional_parameters.'); }

      }

    }else{

      if(fatal){ eu.throwError('server', 'Missing additional_parameters in vendor response.'); }

    }

    return null;

  }

  parseFindOrdersResponse(parsed_response){

    du.debug('Parse Find Orders Response');

    parsed_response = xmlutilities.parse(parsed_response['soap:Envelope']['soap:Body'][0].FindOrders[0]['_']);

    let order = parsed_response.orders.order[0];

    return {
      customer: this.createCustomer(order),
      shipping: this.createShippingInformation(order),
      reference_number: this.createReferenceNumber(order),
      created_at: this.createCreatedAt(order)
    };

  }

  createCustomer(order){

    du.debug('Create Customer');

    let customer = {
      name:order.CustomerName[0],
      email:(stringutilities.nonEmpty(order.CustomerEmail[0]))?order.CustomerEmail[0]:null,
      phone:(stringutilities.nonEmpty(order.CustomerPhone[0]))?order.CustomerPhone[0]:null,
    };

    if(stringutilities.nonEmpty(order.ShipToAddress2[0])){
      customer.address.line2 = order.ShipToAddress2[0];
    }

    return customer;

  }

  createShippingInformation(order){

    du.debug('Create Shipping Information');

    let address = {
      name: order.ShipToName[0],
      line1:order.ShipToAddress1[0],
      city:order.ShipToCity[0],
      state:order.ShipToState[0],
      zip:order.ShipToZip[0],
      country:order.ShipToCountry[0]
    };

    if(stringutilities.nonEmpty(order.ShipToAddress2[0])){
      address.line2 = order.ShipToAddress2[0];
    }

    return {
      address: address,
      carrier:order.Carrier[0],
      tracking_number: (stringutilities.nonEmpty(order.TrackingNumber[0]))?order.TrackingNumber[0]:null,
      method: (stringutilities.nonEmpty(order.ShipMethod[0]))?order.ShipMethod[0]:null
    };

  }

  createReferenceNumber(order){

    du.debug('Create Reference Number');

    return order.ReferenceNum[0];

  }

  createCreatedAt(order){

    du.debug('Create Created At');

    return timestamp.convertToISO8601(order.CreationDate[0]);

  }

}
