'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class createRebillsController extends workerController {

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
        session: global.SixCRM.routes.path('model', 'entities/session.json'),
        rebill: global.SixCRM.routes.path('model', 'entities/rebill.json')
      };

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

      this.rebillHelperController = new RebillHelperController();

      this.instantiateParameters();

    }

    execute(message){

      du.debug('Execute');

      return this.setParameters({argumentation: {message: message}, action: 'execute'})
      .then(() => this.acquireSession())
      .then(() => this.createRebills())
      .then(() => this.respond())
      .catch(error => {
        return super.respond('error', error.message);
      });

    }

    acquireSession(){

      du.debug('Acquire Session');

      let message = this.parameters.get('message');

      return super.acquireSession(message).then(session => {

        this.parameters.set('session', session);

        return true;

      });

    }

    createRebills(){

      du.debug('Create Rebills');

      let session = this.parameters.get('session');

      return this.rebillHelperController.createRebills(session).then(rebill => {

        this.parameters.set('rebill', rebill);

        return true;

      });

    }

    respond(){

      du.debug('Respond');

      let rebill = this.parameters.get('rebill', null, false);

      let response_code = 'fail';

      if(!_.isNull(rebill)){

        response_code = 'success';

      }

      return super.respond(response_code);

    }

}

module.exports = new createRebillsController();
