'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class HoldToPendingForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'holdtopending',
        origin_queue: 'hold',
        destination_queue: 'pending',
        failure_queue: 'pending_failed',
        workerfunction: 'shipProduct.js'
      })

    }

};
