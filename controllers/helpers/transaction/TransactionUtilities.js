'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class TransactionUtilities {

    constructor(){

    }

    //Technical Debt: Broken!
    makeGeneralBrandString(a_string){

      du.debug('Make General Brand String');

      stringutilities.isString(a_string, true);

      return stringutilities.removeWhitespace(a_string).toLowerCase();

    }

    setParameters(parameters){

      du.debug('Set Parameters');

      let temporary = objectutilities.transcribe(this.parameter_definitions.required, parameters, {}, true);

      temporary = objectutilities.transcribe(this.parameter_definitions.optional, parameters, temporary, false);

      objectutilities.map(temporary, (parameter) => {
        this.parameters.set(parameter, temporary[parameter]);
      })

      return Promise.resolve(true);

    }

    //Technical Debt:  Untested
    instantiateParameters(){

      du.debug('Instantiate Parameters');

      const Parameters = global.SixCRM.routes.include('helpers', 'transaction/Parameters.js');

      let validation = {};

      if(_.has(this, 'parameter_validation')){
        validation = this.parameter_validation;
      }

      this.parameters = new Parameters({validation: validation});

    }

    instantiateGateway(){

      du.debug('Instantiate Gateway');

      let selected_merchantprovider = this.parameters.get('selected_merchantprovider', ['gateway.name']);

      const GatewayController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/'+selected_merchantprovider.gateway.name+'/handler.js');

      let gateway = new GatewayController(selected_merchantprovider.gateway);

      this.parameters.set('instantiated_gateway', gateway);

      return Promise.resolve(gateway);

    }

}
