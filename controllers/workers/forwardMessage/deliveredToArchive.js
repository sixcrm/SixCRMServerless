'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class DeliveredToArchiveForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'deliveredtoarchive',
        workerfunction: 'archive.js',
        origin_queue: 'delivered'
      })

    }

};
