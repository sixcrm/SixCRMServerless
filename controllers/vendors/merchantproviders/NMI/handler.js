'use strict';
const _ = require('underscore');
const request = require('request');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class NMIController extends MerchantProvider {

    //Technical Debt:  Need to make use of processor_id somewhere...
    constructor(merchant_provider_parameters){

      super();

      this.configure(merchant_provider_parameters);

    }

    refund(parameters){

      du.debug('Refund');

      return new Promise((resolve, reject) => {

        parameters = this.appendCredentials(parameters);

        var request_options = {
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:     this.vendor_config.endpoint,
            body:    querystring.stringify(parameters)
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
              reject(error);
          }

          var response_body = querystring.parse(body);

          if(_.isObject(response_body) && _.has(response_body, "response")){

            var resolve_object = {
                message: '',
                results: response_body
            };

            switch(response_body.response){

            case '1':

              resolve_object.message = 'Success';
              break;

            case '2':

              resolve_object.message = 'Declined';
              break;

            case '3':

              resolve_object.message = 'Error';
              break;

            default:

              //do nothing...
              break;

            }

            return resolve(resolve_object);

          }else{

              eu.throwError('server', 'Unexpected Error posting to NMI.');

          }

        });

      });

    }

    void(parameters){

        du.debug('Void');

        return new Promise((resolve, reject) => {

          parameters = this.appendCredentials(parameters);

          var request_options = {
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:     this.endpoint,
            body:    querystring.stringify(parameters)
          };

            request.post(request_options, (error, response, body) => {

                if(_.isError(error)){
                    reject(error);
                }

                var response_body = querystring.parse(body);

                if(_.isObject(response_body) && _.has(response_body, "response")){

                    var resolve_object = {
                        message: '',
                        results: response_body
                    };

                    switch(response_body.response){

                    case '1':

                        resolve_object.message = 'Success';
                        break;

                    case '2':

                        resolve_object.message = 'Declined';
                        break;

                    case '3':

                        resolve_object.message = 'Error';
                        break;

                    default:
                        //do nothing...
                        break;

                    }

                    return resolve(resolve_object);

                }else{

                    eu.throwError('server','Unexpected Error posting to NMI.');

                }

            });

        });

    }

    process(request_parameters){

      du.debug('Process');

      return new Promise((resolve, reject) => {

        const method_parameters = {type: 'sale'};

        let parameters = this.createParameterObject();

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters('process', parameters);

        var request_options = {
  			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			  url:     this.get('VendorConfiguration').endpoint,
  			  body:    querystring.stringify(parameters)
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
            reject(error);
          }

          resolve(this.getResponseObject({error: error, response: response, body: body}));

        });

      });

    }

    //Technical Debt:  Validation required
    /*
    createParameterGroup(parameters){

        du.debug('Create Parameter Group');

        var return_object = {};

		//authentication
        return_object.username = this.username;
        return_object.password = this.password;

		//personal
        return_object.firstname = parameters.customer.firstname;
        return_object.lastname = parameters.customer.lastname;

		//creditcard
        return_object.ccnumber = parameters.creditcard.number;
        return_object.ccexp = parameters.creditcard.expiration;
        return_object.ccv = parameters.creditcard.ccv;
        return_object.amount = parameters.amount;

		//billing address
        return_object.address1 = parameters.creditcard.address.line1;
        return_object.city = parameters.creditcard.address.city;
        return_object.state = parameters.creditcard.address.state;
        return_object.zip = parameters.creditcard.address.zip;
        return_object.country = parameters.creditcard.address.country;
        if(_.has(parameters.creditcard.address, "line2")){
            return_object.address2 = parameters.creditcard.address.line2;
        }

		//shipping address
        return_object.shipping_address1 = parameters.customer.address.line1;
        return_object.shipping_city = parameters.customer.address.city;
        return_object.shipping_state = parameters.customer.address.state;
        return_object.shipping_zip = parameters.customer.address.zip;
        return_object.shipping_country = parameters.customer.address.country;
        if(_.has(parameters.customer.address, "line2")){
            return_object.shipping_address2 = parameters.customer.address.line2;
        }

        return return_object;

    }
    */

    setRequestParameters({request_parameters: request_parameters, return_parameters: return_parameters}){

      du.debug('Set Request Parameters');

      let parameters = {
        required: {
          amount:'amount',
          ccnumber:'creditcard.number',
          ccv:'creditcard.ccv',
          ccexp:'creditcard.expiration'
        },
        optional:{
          firstname:'customer.firstname',
          lastname:'customer.lastname',
          address1:'creditcard.address.line1',
          address2:'creditcard.address.line2',
          city:'creditcard.address.city',
          state:'creditcard.address.state',
          zip:'creditcard.address.zip',
          country:'creditcard.address.country',
          shipping_address1: 'customer.address.line1',
          shipping_address2: 'customer.address.line2',
          shipping_city: 'customer.address.city',
          shipping_state: 'customer.address.state',
          shipping_zip: 'customer.address.zip',
          shipping_country: 'customer.address.country'
        }
      };

      return_parameters = objectutilities.transcribe(parameters.required, request_parameters, return_parameters, true);
      return objectutilities.transcribe(parameters.optional, request_parameters, return_parameters, false);

    }

    createParameterObject(){

      du.debug('Create Parameter Object');

      let return_parameters = this.setVendorParameters({return_parameters:{}});

      return_parameters = this.setMerchantProviderParameters({return_parameters:return_parameters});

      return return_parameters;

    }

    setVendorParameters({return_parameters}){

      du.debug('Set Vendor Parameters');

      let vendor = {
        required:{
          endpoint:'endpoint'
        }
      };

      let vendor_configuration = this.get('VendorConfiguration');

      return objectutilities.transcribe(vendor.required, vendor_configuration, return_parameters, true);

    }

    setMerchantProviderParameters({return_parameters}){

      du.debug('Set Merchant Provider Parameters');

      let merchant_provider = {
        required: {
          username: 'username',
          password:'password',
        },
        optional: {
          processor_id: 'processor_id'
        }
      };

      let merchant_provider_configuration = this.get('MerchantProviderParameters');

      return_parameters = objectutilities.transcribe(merchant_provider.required, merchant_provider_configuration, return_parameters, true);

      return objectutilities.transcribe(merchant_provider.optional, merchant_provider_configuration, return_parameters);

    }

    setMethodParameters({return_parameters, method_parameters}){

      du.debug('Set Method Parameters');

      let method = {
        required: {
          type: 'type'
        }
      };

      return objectutilities.transcribe(method.required, method_parameters, return_parameters, true);

    }

}

module.exports = NMIController;
