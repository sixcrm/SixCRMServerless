'use strict'

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class EventEmailsController extends workerController {

  constructor(){
    super();
  }

  execute(){

  }

}

module.exports = new EventEmailsController();
