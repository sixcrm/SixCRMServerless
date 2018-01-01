'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class fulfillmentProviderController {

    constructor(){

      this.parameter_validation = {
        'fulfillmentprovider':global.SixCRM.routes.path('model','entities/fulfillmentprovider.json')
      };

      this.parameter_definition = {
        construct:{
          required:{
            fulfillmentprovider: 'fulfillment_provider'
          },
          optional:{

          }
        }
      };

      this.parameters = new Parameters({definition: this.parameter_definition, validation: this.parameter_validation});

      this.parameters.setParameters({argumentation: arguments[0], action: 'construct'});

    }

    augmentParameters(){

      du.debug('Augment Parameters');

      this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
      this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

      return true;

    }

    respond({additional_parameters}){

      du.debug('Respond');

      let vendor_response = this.parameters.get('vendorresponse');
      let action = this.parameters.get('action');

      const VendorResponseClass = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/'+this.getVendorName()+'/Response.js');

      let response_object = {vendor_response: vendor_response, action: action};

      if(!_.isNull(additional_parameters) && !_.isUndefined(additional_parameters)){
        response_object['additional_parameters'] = additional_parameters;
      }

      return new VendorResponseClass(response_object);

    }

    getVendorName(){

      return objectutilities.getClassName(this).replace('Controller', '');

    }

};
