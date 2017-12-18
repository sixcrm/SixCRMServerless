'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class PickRebillsToBillController extends forwardRebillMessageController {

    constructor(){

      super();

      this.updateParameters();

      this.parameters.set('params', {
          name: 'pickrebillstobill',
          destination_queue: 'bill',
          workerfunction: 'pickRebills.js'
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

      this.rebillHelperController = new RebillHelperController();

      //Technical Debt:  This needs to run in a permissioned context.
      this.message_acquisition_function = this.rebillHelperController.getAvailableRebillsAsMessages.bind(this.rebillHelperController);

    }

    updateParameters() {
      this.parameter_validation['messages'] = global.SixCRM.routes.path('model', 'workers/pickRebills/messages.json');

      this.parameters = new Parameters({validation: this.parameter_validation});
    }

    invokeAdditionalLambdas(){

      du.debug('Invoke Additional Lambdas');
      du.warning('This method is overwritten.');
      du.output('No additional lambda required');

      return Promise.resolve(true);

    }

};
