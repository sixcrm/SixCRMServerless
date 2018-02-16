'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

//Technical Debt:  Need to either mark the rebill with the attempt number or update the method which checks the rebill for existing failed attempts (better idea.)
module.exports = class recoverBillingController extends workerController {

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
    .then(() => this.markRebill())
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

  markRebill(){

    du.debug('Mark Rebill');

    let rebill = this.parameters.get('rebill');
    let register_response_code = this.parameters.get('registerresponsecode');

    if(register_response_code == 'fail'){

      rebill.second_attempt = true;

      if(!_.has(this, 'rebillController')){
        this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
      }

      return this.rebillController.update({entity: rebill}).then(result => {

        this.parameters.set('rebill', result);

        return true;

      });

    }else{

      return Promise.resolve(true);

    }

  }

  respond(){

    du.debug('Respond');

    let register_response_code = this.parameters.get('registerresponsecode');

    return super.respond(register_response_code);

  }

}
