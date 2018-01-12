'use strict';
const forwardSessionMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardSessionMessage.js');

module.exports = class RebillToArchivedForwardMessageController extends forwardSessionMessageController {

    constructor(){

      super();

      this.parameters.set('params', {
        name: 'rebilltoarchive',
        workerfunction: 'createRebills.js',
        origin_queue: 'rebill'
      })

    }

};
