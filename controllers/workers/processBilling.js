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

class processBillingController extends workerController {

  constructor(){
    super();

    this.messages = {
      success: 'BILLED',
      failed: 'FAILED'
    };

    this.parameter_definition = {
      execute: {
        required: {
          event: 'event'
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

  execute(event){

    du.debug('Execute');

    return this.setParameters({argumentation: {event: event}, action: 'execute'})
    .then(() => this.acquireRebill())
    .then(() => this.process())
    //.then(() => this.postProcessing())
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

    return Promise.resolve(true);

  }

  /*
  postProcessing(){

    du.debug('Post Processing');

    return this.evaluateRegisterResponse()
    .then(() => this.markRebill());

  }
  */



  /*
  evaluateRegisterResponse(){

    du.debug('Evaluate Register Response');

    let register_response = this.parameters.get('registerresponse');

    if(register_response.message == 'success'){
      this.parameters.set('responsemessage', this.messages.success);
    }else{
      this.parameters.set('responsemessage', this.messages.failed);
    }

    return Promise.resolve(true);

  }
  */

  /*
  //Technical Debt:  This methodology could lead to state issues.
  //Technical Debt:  We should create a updateField method in the Entity class to address exactly this sort of functionality across
  markRebill(){

    du.debug('Mark Rebill');

    let rebill = this.parameters.get('rebill');

    let now = timestamp.createTimestampSeconds();

    if(_.has(rebill, 'first_attempt')){

      rebill.second_attempt = now;

    }else{

      rebill.first_attempt = now;

    }

    return rebillController.update({entity: rebill}).then(() => {
      return true;
    });

  }
  */

}

module.exports = new processBillingController();
