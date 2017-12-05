'use strict';
var _ =  require('underscore');

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class shipProductController extends workerController {

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
      };

      this.augmentParameters();

    }

    execute(message){

      return this.preamble(message)
      .then(() => this.ship())
      .then(() => this.respond());

    }

    ship(){

      du.debug('Ship');

      let rebill = this.parameters.get('rebill');

      const TerminalController = global.SixCRM.routes.include('providers', 'shipping/Terminal.js');
      let terminalController = new TerminalController();

      return terminalController.shipRebill({rebill: rebill}).then(response => {

        this.parameters.set('terminalresponsecode', response.getCode());

        return Promise.resolve(true);

      });

    }

    respond(){

      du.debug('Respond');

      let terminal_response_code = this.parameters.get('terminalresponsecode');

      return super.respond(terminal_response_code);

    }

}

module.exports = new shipProductController();
