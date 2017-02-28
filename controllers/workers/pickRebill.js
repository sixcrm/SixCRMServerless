'use strict';
var _ = require("underscore");

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
		console.log("pickRebill executes ...");
		return new Promise((resolve, reject) => {
			
			var now = timestamp.createTimestampSeconds();
	
			rebillController.getRebillsAfterTimestamp(now).then((rebills) => {
				console.log("Executed promise for rebills ....");
				Promise.all(rebills.map(rebill => rebillController.sendMessageAndMarkRebill(rebill))).then((values) => {
					
					//do something here?		
					
				}).then(() => {
					
					resolve(true);
					
				});
				
			});
			
		});
		
	}

}

module.exports = new pickRebillController();