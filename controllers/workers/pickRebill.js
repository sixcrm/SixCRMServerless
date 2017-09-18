'use strict';
var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

class pickRebillController extends workerController {

    constructor(){
        super();
    }

    execute(){

        return this.pickRebill();

    }

    pickRebill(){

        let now = timestamp.createTimestampSeconds();

        return rebillController.getRebillsAfterTimestamp(now)
            .then((rebills) => Promise.all(rebills.map(rebill => rebillController.sendMessageAndMarkRebill(rebill))))
            .then(() => true);
    }

}

module.exports = new pickRebillController();
