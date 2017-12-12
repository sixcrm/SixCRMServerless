'use strict'
const _ = require('underscore');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class TerminalResponse extends Response {

  constructor(){

    super();

    this.parameter_validation = {
      'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
      'providerresponse':global.SixCRM.routes.path('model', 'providers/shipping/terminal/providerresponse.json')
    };

    this.parameter_definition = {
      'constructor':{
        required:{

        },
        optional:{
          rebill: 'rebill',
          response_type:'response_type',
          providerresponse:'provider_response'
        }
      }
    }

    this.initialize();

    if(objectutilities.nonEmpty(arguments)){
      this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});
    }

  }

  setProviderResponse(provider_response){

    this.parameters.set('providerresponse', provider_response);

  }

  getProviderResponse(){

    return this.parameters.get('providerresponse', null, false);

  }

}
