'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class PickRebillsToBillController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'pickrebillstobill',
        destination_queue: 'bill',
        workerfunction: 'pickRebills.js'
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

      this.rebillHelperController = new RebillHelperController();

      this.message_acquisition_function = this.rebillHelperController.getAvailableRebillsAsMessages;

    }

    invokeAdditionalLambdas(messages){

      du.debug('Invoke Additional Lambdas');
      du.warning('This method is overwritten.');
      du.output('No additional lambda required');

      return Promise.resolve(messages);

    }

    validateMessages(messages){

      du.debug('Validate Messages');
      du.warning('This method is overwritten.');

      mvu.validateModel(messages, global.SixCRM.routes.path('model', 'workers/pickRebills/messages.json'));

      return Promise.resolve(messages);

    }

};
