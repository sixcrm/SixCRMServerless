'use strict';
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class RebillToArchivedForwardMessageController extends forwardRebillMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'rebilltoarchive',
        workerfunction: 'createRebills.js',
        origin_queue: 'rebill'
      })

    }

};
