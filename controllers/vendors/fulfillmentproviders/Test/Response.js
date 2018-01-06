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

module.exports = class TestResponse extends FulfillmentProviderVendorResponse {

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

    if(!stringutilities.nonEmpty(response.body)){
      return null;
    }

    return this.parseGetInfoResponse(response);


  }

  translateTest(response){

    du.debug('Translate Test');

    if(!stringutilities.nonEmpty(response.body)){
      return null;
    }

    return {
      success: true,
      message: 'Successfully validated.'
    };

  }

  translateFulfill(response){

    du.debug('Translate Fulfill');

    if(!stringutilities.nonEmpty(response.body)){
      return null;
    }

    let reference_number = this.acquireReferenceNumber();

    let response_prototype = {
      success: true,
      message: 'Success',
      reference_number: reference_number
    };

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

  /*
  parseGetInfoResponse(response){

    du.debug('Parse Get Info Response');

    return {
      customer: this.createCustomer(order),
      shipping: this.createShippingInformation(order),
      reference_number: this.createReferenceNumber(order),
      created_at: this.createCreatedAt(order)
    };

  }
  */

}
