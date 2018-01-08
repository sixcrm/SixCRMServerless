'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const xmlutilities = global.SixCRM.routes.include('lib', 'xml-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const ShippingCarrierVendorResponse = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');

module.exports = class USPSResponse extends ShippingCarrierVendorResponse {

  constructor({vendor_response, action, additional_parameters}){

    super(arguments[0]);

    this.parameter_definition = {};

    this.parameter_validation = {
      'trackingnumber':global.SixCRM.routes.path('model','vendors/shippingcarriers/USPS/trackingnumber.json'),
      'parsedvendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/parsedresponse.json')
    }

    this.augmentParameters();

    this.transformResponse();

  }

  transformResponse(){

    du.debug('Transform Response');

    let action = this.parameters.get('action');

    let transformers = {
      'info':() => this.transformInfoResponse()
    }

    return transformers[action]();

  }

  transformInfoResponse(){

    du.debug('Transform Info Response');

    let vendor_response = this.parameters.get('vendorresponse');

    if(vendor_response.statusCode == 200){

      this.parseResponseXML();

      this.setTrackingNumber();
      this.setStatus();
      this.setDetail();

      this.infoResponse();

    }else{

      eu.throwError('server', 'USPS returned a non-200 HTTP status code.');
    }

  }

  parseResponseXML(){

    du.debug('Parse Response XML');

    let vendor_response = this.parameters.get('vendorresponse');
    let response_xml = vendor_response.body;
    let parsed_response = xmlutilities.parse(response_xml, true);

    this.parameters.set('parsedvendorresponse', parsed_response);

    return true;

  }

  setTrackingNumber(){

    du.debug('Set Tracking Number');

    let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

    if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.$.ID')){
      this.parameters.set('trackingnumber', parsed_vendor_response.TrackResponse.TrackInfo[0].$.ID);
      return true;
    }

    return false;

  }

  setStatus(){

    du.debug('Set Status');

    let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

    if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackSummary.0')){

      let status = this.determineStatus(parsed_vendor_response.TrackResponse.TrackInfo[0].TrackSummary[0]);

      this.parameters.set('status', status);

      return true;

    }else if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.Error.0.Description.0')){

      this.parameters.set('status', 'unknown');

    }

    return false;

  }

  determineStatus(detail_string){

    du.debug('Determine Status');

    let status = 'intransit';

    if(stringutilities.isMatch(detail_string, /^.*delivered.*$/)){
      status = 'delivered';
    }

    return status;

  }


  setDetail(){

    du.debug('Set Detail');

    let parsed_vendor_response = this.parameters.get('parsedvendorresponse');

    if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.TrackSummary.0')){
      this.parameters.set('detail', parsed_vendor_response.TrackResponse.TrackInfo[0].TrackSummary[0]);
      return true;
    }else if(objectutilities.hasRecursive(parsed_vendor_response, 'TrackResponse.TrackInfo.0.Error.0.Description')){
      this.parameters.set('detail', parsed_vendor_response.TrackResponse.TrackInfo[0].Error[0].Description[0]);
      return true;
    }

    return false;

  }

  setMessage(message){

    du.debug('Set Message');

    this.parameters.set('message', message);

    return true;

  }

  getMessage(){

    du.debug('Get Message');

    return this.parameters.get('message')

  }

}
