'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class PendingFailedToPendingForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'pendingfailedtopending',
        workerfunction: 'shipProduct.js',
        origin_queue: 'pending_failed',
        destination_queue: 'pending'
      })

    }

};
