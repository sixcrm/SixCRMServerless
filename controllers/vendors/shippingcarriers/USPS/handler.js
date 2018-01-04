'use strict';
var _ = require('underscore');
var request = require('request');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parseString = require('xml2js').parseString;

const ShippingCarrierController = global.SixCRM.routes.include('controllers', 'vendors/shippingcarriers/components/ShippingCarrier.js');

class USPSController extends ShippingCarrierController {

    constructor(){

      super();

      this.shortname = 'usps';

      this.stati = {
        delivered: 'delivered',
        instransit: 'intransit',
        unknown: 'unknown'
      }

      this.parameter_definition = {
        getStatus: {
          required: {
            trackingnumber: 'trackingnumber'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'trackingnumber': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/trackingnumber.json'),
        'userid': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/userid.json'),
        'requestxml': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requestxml.json'),
        'requesturi': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requesturi.json'),
        'apiresponse': global.SixCRM.routes.path('model', 'general/request/response.json'),
        'apiresponsebody': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/requestresponsebody.json'),
        'parsedapiresponsebody': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/parsedapiresponsebody.json'),
        'processedparsedapiresponsebody': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/USPS/processedparsedapiresponsebody.json'),
      };

      this.augmentParameters();

      this.acquireConfigurationInformation();

    }

    info(tracking_number){

      du.debug('info');

      return this.setParameters({argumentation: {trackingnumber: tracking_number}, action: 'getStatus'})
      .then(() => this.acquireAPIResult())
      .then(() => this.parseAPIResponseBody())
      .then(() => this.processParsedAPIResponseBody())
      .then(() => this.respond());

    }

    acquireAPIResult(){

      du.debug('Acquire API Result');

      return Promise.resolve()
      .then(() => this.buildRequestXML())
      .then(() => this.buildRequestURI())
      .then(() => this.executeAPIRequest())
      .then(() => this.validateAPIResponse());

    }

    executeAPIRequest(){

      du.debug('Execute API Request');

      let request_uri = this.parameters.get('requesturi');

      return new Promise((resolve) => {

        request(request_uri, (error, response, body) => {

          if(error){
            eu.throw(error);
          }

          this.parameters.set('apiresponse', response);
          this.parameters.set('apiresponsebody', body);

          return resolve(true);

        });

      });

    }

    validateAPIResponse(){

      du.debug('Handle API Response');

      let response = this.parameters.get('apiresponse');

      if(response.statusCode !== 200){
        eu.throwError('server', 'USPS API returned a non-200 status code: '+response.statusCode);
      }

      return true;

    }

    parseAPIResponseBody(){

      du.debug('Parse API Response Body');

      let api_response_body = this.parameters.get('apiresponsebody');

      return new Promise((resolve) => {

        parseString(api_response_body, (error, result) => {

          if(_.isError(error)){
            eu.throwError('server', 'Unable to parse API response body.');
          }

          this.parameters.set('parsedapiresponsebody', result);

          return resolve(true);

        });

      });

    }

    processParsedAPIResponseBody(){

      du.debug('Acquire Status From Parsed API Response Body');

      let parsedapiresponsebody = this.parameters.get('parsedapiresponsebody');

      let usps_response = parsedapiresponsebody.TrackResponse.TrackInfo[0].TrackSummary[0];

      let status = this.parseTrackSummaryMessage(usps_response);

      let delivered = (status == this.stati.delivered);

      this.parameters.set('processedparsedapiresponsebody', {
        status: status,
        message: usps_response,
        delivered: delivered
      });

      return Promise.resolve(true);

    }

    buildRequestURI(){

      du.debug('Build URI');

      let request_xml = this.parameters.get('requestxml');

      let request_uri = 'http://production.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML='+encodeURIComponent(request_xml);

      this.parameters.set('requesturi', request_uri);

      return true;

    }

    buildRequestXML(){

      du.debug('Build Request XML');

      let tracking_number = this.parameters.get('trackingnumber');
      let user_id = this.parameters.get('userid');

      let request_xml = '<?xml version="1.0" encoding="UTF-8" ?><TrackFieldRequest USERID="'+user_id+'"><TrackID ID="'+tracking_number+'"/></TrackFieldRequest>';

      this.parameters.set('requestxml', request_xml);

      return true;

    }

    parseTrackSummaryMessage(track_summary_message){

      du.debug('Parse Track Summary Message');

      if(track_summary_message.indexOf('delivered') > -1) {

        return this.stati.delivered;

      }

      if(track_summary_message.indexOf('arrived') > -1 || track_summary_message.indexOf('departed')) {

        return this.stati.intransit;

      }

      return this.stati.unknown;

    }

    acquireConfigurationInformation(){

      du.debug('Acquire Configuration Information');

      this.parameters.set('userid', global.SixCRM.configuration.site_config.shipping_providers.usps.user_id);

      return true;

    }

    respond(){

      du.debug('Respond');

      let processed_parsed_api_response_body = this.parameters.get('processedparsedapiresponsebody');

      const ShippingProviderResponse  = global.SixCRM.routes.include('vendors', 'shippingcarriers/components/Response.js');
      let shippingProviderResponse = new ShippingProviderResponse({
        shortname: this.shortname,
        parameters: {
          delivered: processed_parsed_api_response_body.delivered,
          status: processed_parsed_api_response_body.status,
          detail: processed_parsed_api_response_body.message
        },
        result: 'success'
      });

      return shippingProviderResponse;

    }

}

module.exports = new USPSController();
