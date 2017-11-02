'use strict';
const _ = require("underscore");

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilties = global.SixCRM.routes.include('lib', 'math-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');
const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

//Technical Debt:  Need to either mark the rebill with the attempt number or update the method which checks the rebill for existing failed attempts (better idea.)
class processBillingController extends workerController {

  constructor(){
    super();

    this.parameter_definition = {
      execute: {
        required: {
          message: 'message'
        },
        optional:{}
      }

    }

    this.parameter_validation = {
      event: global.SixCRM.routes.path('model', 'workers/processBilling/event.json'),
      rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
      registerresponse: global.SixCRM.routes.path('model', 'functional/register/response.json')
    }

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({
      validation: this.parameter_validation,
      definition: this.parameter_definition
    });

  }

  execute(message){

    du.debug('Execute');

    return this.setParameters({argumentation: {message: message}, action: 'execute'})
    .then(() => this.acquireRebill())
    .then(() => this.process())
    .then(() => this.respond());

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let event = this.parameters.get('event');

    return super.acquireRebill(event);

  }

  setParameters(thing){

    du.debug('Set Parameters');

    this.parameters.setParameters(arguments[0]);

    return Promise.resolve(true);

  }

  //Technical Debt:  Merchant Provider is necessary in the context of a rebill
  process(){

    du.debug('Process');

    let rebill = this.parameters.get('rebill');

    const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
    let registerController = new RegisterController();

    return registerController.processTransaction({rebill: rebill}).then(response => {

      this.parameters.set('registerresponse', response);

      return Promise.resolve(true);

    });

  }

  respond(){

    du.debug('Respond');

    let register_response = this.parameters.get('registerresponse');

    //validate register response
    return super.response('success');

  }

}

module.exports = new processBillingController();
