'use strict';
var timestamp = require('../../lib/timestamp.js');

var rebillController = require('../Rebill.js');
var workerController = require('./worker.js');

class pickRebillController extends workerController {

    constructor(){
        super();
    }

    execute(){

        return this.pickRebill();

    }

    pickRebill(){
        return new Promise((resolve) => {

            var now = timestamp.createTimestampSeconds();

            return rebillController.getRebillsAfterTimestamp(now).then((rebills) => {
                return Promise.all(rebills.map(rebill => rebillController.sendMessageAndMarkRebill(rebill))).then(() => {

					//Technical Debt: do something here?
                    return;

                }).then(() => {

                    return resolve(true);

                });

            });

        });

    }

}

module.exports = new pickRebillController();