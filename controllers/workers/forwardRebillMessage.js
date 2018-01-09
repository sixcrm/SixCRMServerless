'use strict';
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

module.exports = class forwardRebillMessageController extends forwardMessageController {

    constructor(){

      super();

      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

    }

    handleWorkerResponseObject(worker_response_object){

      du.debug('Forward Rebill Message Controller: Handle Worker Response Object');

      return this.updateRebillState(worker_response_object)
        .then((worker_response_object) => super.handleWorkerResponseObject(worker_response_object));

    }

    updateRebillState(compound_worker_response_object) {

      du.debug('Update Rebill State');

      let params = this.parameters.get('params');

      const rebill_id = JSON.parse(compound_worker_response_object.message.Body);

      const previous_state = params.origin_queue;
      let new_state  = params.destination_queue;

      if (compound_worker_response_object.worker_response_object.getCode() === 'fail') {
        new_state = params.failure_queue;
      }

      if (compound_worker_response_object.worker_response_object.getCode() === 'error') {
        new_state = params.error_queue;
      }

      if(!_.has(this, 'rebillHelperController')){
        const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

        this.rebillHelperController = new RebillHelperController();
      }

      return this.rebillController.get({id: rebill_id})
      .then((rebill) => this.rebillHelperController.updateRebillState({rebill: rebill, new_state: new_state, previous_state: previous_state}))
      .then(() => Promise.resolve(compound_worker_response_object));

    }

};
