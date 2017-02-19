'use strict';
var _ = require("underscore");

var workerController = require('./worker.js');

class archiveController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			success: 'ARCHIVED'
		}
	}
	
	execute(event){
		
		return this.acquireRebill(event).then((rebill) => this.archive(rebill));
		
	}	
	
	archive(rebill){
	
		return new Promise((resolve, reject) => {
			
			//do something like "archive" it...
			
			resolve(this.messages.success);
			
		});
		
	}

}

module.exports = new archiveController();