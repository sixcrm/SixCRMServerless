'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class BillToHoldForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'recovertohold',
        origin_queue: 'recover',
        destination_queue: 'hold',
        workerfunction: 'processBilling.js',
      });

    }

};
