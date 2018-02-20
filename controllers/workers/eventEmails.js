'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class EventEmailsController extends workerController {

  constructor(){
    super();
  }

  execute(){

    du.output(arguments)
    return Promise.resolve(true);
  }

}

module.exports = new EventEmailsController();
