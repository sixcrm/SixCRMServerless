'use strict';

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

    respond(){

      du.debug('Respond');

      let provider_response = this.parameters.get('providerresponse');

      const VendorResponseClass = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/'+this.getVendorName()+'/Response.js');

      return new VendorResponseClass(provider_response);

    }

    getVendorName(){

      return objectutilities.getClassName(this).replace('Controller', '');

    }

};
