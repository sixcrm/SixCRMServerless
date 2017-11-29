'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

module.exports = class forwardRebillMessageController extends forwardMessageController {

    constructor(params){

      super(params);

      this.rebillHelperController = new RebillHelperController();

    }

    handleWorkerResponseObject(worker_response_object){

      du.debug('Forward Rebill Message Controller: Handle Worker Response Object');

      return this.updateRebillState(worker_response_object)
        .then((worker_response_object) => super.handleWorkerResponseObject(worker_response_object));

    }

    updateRebillState(compound_worker_response_object) {
      du.debug('Update Rebill State');

      const rebill = JSON.parse(compound_worker_response_object.message.Body);

      const previousState = this.params.origin_queue;
      let newState  = this.params.destination_queue;
      let errorMessage;

      if (compound_worker_response_object.worker_response_object.getCode() === 'fail') {
        newState = this.params.failure_queue;
      }

      if (compound_worker_response_object.worker_response_object.getCode() === 'error') {
        newState = this.params.error_queue;
      }

      return this.rebillHelperController
        .updateRebillState({rebill: rebill, newState: newState, previousState: previousState, errorMessage: errorMessage})
        .then(() => Promise.resolve(compound_worker_response_object));
    }

};