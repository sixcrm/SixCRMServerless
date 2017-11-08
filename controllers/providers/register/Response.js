'use strict'
const _ = require('underscore');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class RegisterResponse extends Response {

  constructor(){

    super();

    this.parameter_validation = {
      'transaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'processorresponse': global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
    };

    this.parameter_definition = {
      'constructor':{
        required:{},
        optional:{
          response_type:'response_type',
          transaction:'transaction',
          processorresponse:'processor_response'
        }
      }
    }

    this.initialize();

    if(objectutilities.nonEmpty(arguments)){
      this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});
    }

  }

  setTransaction(transaction){

    this.parameters.set('transaction', transaction);

  }

  getTransaction(){

    return this.parameters.get('transaction', false);

  }

  setProcessorResponse(processor_response){

    this.parameters.set('processorresponse', processor_response);

  }

  getProcessorResponse(){

    return this.parameters.get('processorresponse', false);

  }

}
