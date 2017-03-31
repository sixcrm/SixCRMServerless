'use strict';
var rebillController = require('../Rebill.js');
var productScheduleController = require('../ProductSchedule.js');
var workerController = require('./worker.js');

class createRebillsController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			success:'SUCCESS',
			successnoaction:'SUCCESSNOACTION',
			failure:'FAIL'
		}
	}
	
	execute(event){

		return this.acquireSession(event).then((session) => this.createRebills(session));
		
	}	
	
	createForwardMessage(event){
		
		return Promise.resolve({message: "Rebills created.  Archive."});

	}
	
	createRebills(session){
		
		return new Promise((resolve, reject) => {
		
			productScheduleController.getProductSchedules(session.product_schedules).then((schedules_to_purchase) => {
				
				rebillController.createRebills(session, schedules_to_purchase).then((rebills) => {

					if(rebills.length > 0){
						
						return resolve(this.messages.success);
					
					}else{
						
						return resolve(this.messages.successnoaction);
						
					}
						
				}).catch((error) => {
					reject(error);
				});
			
			}).catch((error) => {
				reject(error);
			});
			
			
		});
		
	}

}

module.exports = new createRebillsController();