'use strict'
const _ =  require('underscore');
const du = require('./debug-utilities.js');
const timestamp = require('./timestamp.js');

class IndexingUtilities {
	
	constructor(){
		
	}
	
	removeFromSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
		
			du.debug('De-indexing entity: ', entity);
			
		});
		
	}
	
	addToSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
			
			du.debug('Adding entity to search index:', entity, entity_type);
		
			if(_.has(process.env, 'search_indexing_queue_url')){
				
				entity.entity_type = entity_type;
			
				sqs.sendMessage({message_body: entity, queue_url: process.env.search_indexing_queue_url}, (error, data) => {
				
					if(_.isError(error)){ return reject(error); }
					
					return resolve(true);

				});
				
			}else{
			
				return reject(new Error('Missing search_indexing_queue_url definition in the process.env object.'));
		
			}
			
		});
		
	}
	
}	

var iu = new IndexingUtilities();

module.exports = iu;