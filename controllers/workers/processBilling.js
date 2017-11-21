'use strict';
const _ = require("underscore");

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilties = global.SixCRM.routes.include('lib', 'math-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');
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
    };

    this.parameter_validation = {
      message: global.SixCRM.routes.path('model', 'workers/sqsmessage.json'),
      rebill: global.SixCRM.routes.path('model', 'entities/rebill.json')
      //registerresponse: global.SixCRM.routes.path('model', 'functional/register/response.json')
    };

    this.instantiateParameters();

  }

  execute(message){

    du.debug('Execute');

    return this.setParameters({argumentation: {message: message}, action: 'execute'})
    .then(() => this.acquireRebill())
    .then((rebill) => {
      this.parameters.set('rebill', rebill);
    })
    .then(() => this.process())
    .then(() => this.respond())
    .catch((error) => {
      return super.respond('error', error.message);
    })

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let message = this.parameters.get('message');

    return super.acquireRebill(message);

  }

  //Technical Debt:  Merchant Provider is necessary in the context of a rebill
  process(){

    du.debug('Process');

    let rebill = this.parameters.get('rebill');

    const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
    let registerController = new RegisterController();

    return registerController.processTransaction({rebill: rebill}).then(response => {
      //this is a register response object.
      this.parameters.set('registerresponse', response);

      return Promise.resolve(true);

    });

  }

  respond(){

    du.debug('Respond');

    let register_response = this.parameters.get('registerresponse').getCode();

    return super.respond(register_response);

  }

}

module.exports = new processBillingController();
