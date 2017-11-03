'use strict'
const _ = require('underscore');

const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class RegisterResponse extends Response {

  constructor({transaction, processor_response, response_type}){

    super()

    this.parameter_validation = {
      'transaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
      'processor_response': global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
    };

    this.parameter_definition = {
      'constructor':{
        required:{},
        optional:{
          response_type:'response_type',
          transaction:'transaction',
          processor_response:'processor_response'
        }
      }
    }

    this.initialize();

    this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});

  }

  setTransaction(transaction){

    this.parameters.set('transaction', transaction);

  }

  getTransaction(){

    return this.parameters.get('transaction', false);

  }

  setProcessorResponse(processor_response){

    this.parameters.set('processor_response', processor_response);

  }

  getProcessorResponse(){

    return this.parameters.get('processor_response', false);

  }

}
