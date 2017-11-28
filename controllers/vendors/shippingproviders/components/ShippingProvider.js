'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class shippingProviderController {

  constructor(){

    this.stati = {
      delivered: 'delivered',
      instransit: 'intransit',
      unknown: 'unknown'
    }

    this.initialize();

  }

  initialize(){

    du.debug('Initialize');

    let parameter_validation = {}

    let parameter_definition = {};

    const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new ParametersController({
      validation: parameter_validation,
      definition: parameter_definition
    });

  }

  augmentParameters(){

    du.debug('Augment Parameters');

    this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
    this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

    return true;

  }

  setParameters(parameters_object){

    du.debug('Set Parameters');

    this.parameters.setParameters(parameters_object);

    return Promise.resolve(true);

  }

}
