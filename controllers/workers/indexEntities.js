'use strict';
var _ = require("underscore");

const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');
const indexingutilities = require('../../lib/indexing-utilities.js');
const du = require('../../lib/debug-utilities.js');

var workerController = require('./worker.js');

class indexEntitiesController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			success:'SUCCESS',
			successnoaction:'SUCCESSNOACTION',
			failure:'FAIL'
		}
	}
	
	execute(event){
		
		return new Promise((resolve, reject) => {
			
			let processed_documents = indexingutilities.createIndexingDocument([event]);
			
			cloudsearchutilities.uploadDocuments(processed_documents).then((response) => {
			
				if(_.has(response, 'status') && response.status == 'success'){
					return resolve(this.messages.success);
				}else{
					return resolve(this.messages.successnoaction);
				}
		
			}).catch((error) => {
				return reject(this.messages.failure);
			});
		
		});
		
	}

}

module.exports = new indexEntitiesController();