'use strict'
const _ =  require('underscore');
const du = require('./debug-utilities.js');
const timestamp = require('./timestamp.js');
const sqs = require('./sqs-utilities.js');

class IndexingUtilities {
	
	constructor(){
		
		//Technical Debt:  This needs to be configured...
		this.indexing_entities = [
			'campaign', 
			'credit_card', 
			'merchant_provider', 
			'product_schedule', 
			'product', 
			'shipping_receipt', 
			'customer', 
			'transaction', 
			'user'
		];
		
		//Technical Debt:  This needs to be configured...
		this.indexing_list = [
			'entity_type', 
			'id', 
			'active', 
			'email', 
			'firstname', 
			'lastname', 
			'name', 
			'phone', 
			'sku', 
			'tracking_number', 
			'address', 
			'amount', 
			'alias', 
			'first_six', 
			'last_four', 
			'account'
		];
		
	}
	
	updateSearchIndex(entity){
		
		return new Promise((resolve, reject) => {
		
			du.debug('updating search index for entity: ', entity);
			
			return resolve(true);
				
		});
		
	}
	
	
	removeFromSearchIndex(entity){
		
		du.debug('Remove from search index:', entity);
		
		entity.type = 'delete';
		
		return this.pushToIndexingBucket(entity);
		
	}
	
	addToSearchIndex(entity){
		
		du.debug('Add to search index:', entity);
		
		entity.type = 'add';
		
		return this.pushToIndexingBucket(entity);
		
	}
	
	pushToIndexingBucket(entity){
	
		return new Promise((resolve, reject) => {
			
			if(_.has(process.env, 'search_indexing_queue_url')){
				
				if(_.has(entity, 'type') && _.contains(['add', 'delete'], entity.type)){
				
					if(_.has(entity, 'entity_type')){
						
						if(_.contains(this.indexing_entities, entity.entity_type)){
				
							let abridged_entity = this.createAbridgedEntity(entity);
				
							let abridged_entity_string = JSON.stringify(abridged_entity);
				
							sqs.sendMessage({message_body: abridged_entity_string, queue_url: process.env.search_indexing_queue_url}, (error, data) => {
				
								if(_.isError(error)){ return reject(error); }
					
								return resolve(true);

							});
							
						}else{
							
							// We don't need to index this thing.  Succeed quietly.	
							return resolve(false);
							
						}
					
					}else{
					
						return reject(new Error('Indexable entities must have a "Entity Type".'));
					
					}
					
				}else{
				
					return reject(new Error('Indexable entities must have a "type" which is either "add" or "delete".'));
					
				}
				
			}else{
			
				return reject(new Error('Missing search_indexing_queue_url definition in the process.env object.'));
		
			}
			
		});
		
	}
	
	createAbridgedEntity(entity){
	
		let abridged_entity = {};
		
		for (var k in entity){
			if(_.contains(this.indexing_list, k)){
				
				abridged_entity[k] = entity[k];
				
			}	
		}
			
		return abridged_entity;
	
	}
	
	createIndexingDocument(documents_array){
		
		let response = [];
		
		documents_array.forEach((document) => {
		
			if(_.has(document, 'type') && _.contains(['add','delete'], document.type) && _.has(document, 'id')){		
			
				let processed_document = {};
				
				for(var k in document){
				
					if(_.contains(['type','id'], k)){
					
						processed_document[k] = document[k]
						
					}else{
					
						if(!_.has(processed_document, 'fields')){
						
							processed_document.fields = {};
							
						}
						
						if(_.isString(document[k])){
							processed_document.fields[k] = document[k];
						}else{
							processed_document.fields[k] = JSON.stringify(document[k]);
						}
						
					}
					
				}
				
				response.push(processed_document);
				
			}
		});
		
		return new Buffer.from(JSON.stringify(response));
		
	}
	
}	

var iu = new IndexingUtilities();

module.exports = iu;