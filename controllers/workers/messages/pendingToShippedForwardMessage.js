'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class PendingToShippedForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'pendingtoshipped',
        workerfunction: 'confirmShipped.js',
        origin_queue: 'pending',
        destination_queue: 'shipped'
      })

    }

};
