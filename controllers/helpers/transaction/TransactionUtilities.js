'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class TransactionUtilities {

    constructor(){

      this.brandaliases = {
        'amex':'americanexpress'
      };

    }

    //Technical Debt: Broken!
    makeGeneralBrandString(a_string){

      du.debug('Make General Brand String');

      stringutilities.isString(a_string, true);

      let transformed_string = stringutilities.removeWhitespace(a_string).toLowerCase();

      if(_.has(this.brandaliases, transformed_string)){
        return this.brandaliases[transformed_string];
      }

      return transformed_string;

    }

    setParameters(parameters){

      du.debug('Set Parameters');

      let temporary = objectutilities.transcribe(this.parameter_definitions.required, parameters, {}, true);

      temporary = objectutilities.transcribe(this.parameter_definitions.optional, parameters, temporary, false);

      objectutilities.map(temporary, (parameter) => {
        this.parameters.set(parameter, temporary[parameter]);
      });

      return Promise.resolve(true);

    }

    //Technical Debt:  Untested
    instantiateParameters(){

      du.debug('Instantiate Parameters');

      let validation = {};
      let definition = {};

      if(_.has(this, 'parameter_validation')){
        validation = this.parameter_validation;
      }

      if(_.has(this, 'parameter_definition')){
        definition = this.parameter_definition;
      }

      this.parameters = new Parameters({validation: validation, definition: definition});

    }

    instantiateGateway(){

      du.debug('Instantiate Gateway');

      let selected_merchantprovider = this.parameters.get('selected_merchantprovider', ['gateway.name']);

      const GatewayController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/'+selected_merchantprovider.gateway.name+'/handler.js');

      let gateway = new GatewayController({merchant_provider: selected_merchantprovider});

      this.parameters.set('instantiated_gateway', gateway);

      return Promise.resolve(gateway);

    }

}
