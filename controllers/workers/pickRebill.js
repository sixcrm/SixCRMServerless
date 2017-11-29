'use strict';
const _ = require('underscore');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

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
      let this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
    }

    return this.rebillController.getRebillsAfterTimestamp(now).then(rebills => {

      this.parameters.set('rebills', rebills);

      return true;

    });

  }

  markRebillsAsProcessing(){

    du.debug('Mark Rebills As Processing');

    let rebills = this.parameters.get('rebills');

    if(!_.has(this, 'rebillController')){
      let this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
    }

    return this.rebillController.markRebillAsProcessing({rebill: rebill, new_state: this.destination_queue}).then(rebill => {

      return true;

    });

  }


  pickRebill(){



    .then(() => this.markRebillsAsProcessing())
    .then(() => this.respond());
    return this.rebillController.getRebillsAfterTimestamp(now)
    .then(() => {

    })
    .then((rebills) => {}Promise.all(rebills.map(rebill => rebillController.sendMessageAndMarkRebill(rebill))))
    .then(() => true);

  }



}

module.exports = new pickRebillController();
