'use strict';
const _ = require("underscore");

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilties = global.SixCRM.routes.include('lib', 'math-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
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
      registerresponsecode: global.SixCRM.routes.path('model', 'general/response/responsetype.json')
    };

    this.augmentParameters();

  }

  execute(message){

    du.debug('Execute');

    return this.preamble(message)
    .then(() => this.process())
    .then(() => this.respond())
    .catch((error) => {
      return super.respond('error', error.message);
    })

  }

  //Technical Debt:  Merchant Provider is necessary in the context of a rebill
  process(){

    du.debug('Process');

    let rebill = this.parameters.get('rebill');

    const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
    let registerController = new RegisterController();

    return registerController.processTransaction({rebill: rebill}).then(response => {

      this.parameters.set('registerresponsecode', response.getCode());

      return Promise.resolve(true);

    });

  }

  respond(){

    du.debug('Respond');

    let register_response_code = this.parameters.get('registerresponsecode');

    return super.respond(register_response_code);

  }

}

module.exports = new processBillingController();
