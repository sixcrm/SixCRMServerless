'use strict'
const _ =  require('underscore');
const du = require('./debug-utilities.js');
const timestamp = require('./timestamp.js');
const sqs = require('./sqs-utilities.js');

class IndexingUtilities {
	
	constructor(){
		
	}
	
	updateSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
		
			du.debug('updating search index for entity: ', entity);
			
			return resolve(true);
				
		});
		
	}
	
	
	removeFromSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
		
			du.debug('De-indexing entity: ', entity);
			
			return resolve(true);
			
		});
		
	}
	
	addToSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
			
			du.debug('Adding entity to search index:', entity);
		
			if(_.has(process.env, 'search_indexing_queue_url')){
				
				let abridged_entity = this.createAbridgedEntity(entity);
				
				sqs.sendMessage({message_body: entity_string, queue_url: process.env.search_indexing_queue_url}, (error, data) => {
				
					if(_.isError(error)){ return reject(error); }
					
					return resolve(true);

				});
				
			}else{
			
				return reject(new Error('Missing search_indexing_queue_url definition in the process.env object.'));
		
			}
			
		});
		
	}
	
	createAbridgedEntity(entity){
	
		return entity;
		//for ever key that is not configured, remove it.
		//stringify
	
	}
	
}	

var iu = new IndexingUtilities();

module.exports = iu;