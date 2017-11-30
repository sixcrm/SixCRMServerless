'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

class pickRebillController extends workerController {

  constructor(){

    super();

  }

  execute(){

    du.debug('Execute');

    return this.acquireRebills()
    .then(() => this.markRebillsAsProcessing())
    .then(() => this.respond());

  }

  acquireRebills(){

    du.debug('Acquire Rebills');

    let now = timestamp.createTimestampSeconds();

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
    }

    return this.rebillController.getRebillsAfterTimestamp(now).then(rebills => {

      this.parameters.set('rebills', rebills);

      return Promise.resolve();

    });

  }

  markRebillsAsProcessing(){

    du.debug('Mark Rebills As Processing');

    let rebills = this.parameters.get('rebills');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
    }

    const worker_promises = arrayutilities.map(rebills, (rebill) => {
      return this.rebillController.markRebillAsProcessing(rebill)
    });

    return Promise.all(worker_promises).then(() => {

      return Promise.resolve();

    });

  }

}

module.exports = new pickRebillController();
