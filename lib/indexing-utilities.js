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
			'index_action',
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
		
		entity.index_action = 'delete';
		
		du.debug('Remove from search index:', entity);
		
		return this.pushToIndexingBucket(entity);
		
	}
	
	addToSearchIndex(entity){
		
		du.debug('Add to search index:', entity);
		
		entity.index_action = 'add';
		
		return this.pushToIndexingBucket(entity);
		
	}
	
	pushToIndexingBucket(entity){
	
		return new Promise((resolve, reject) => {
			
			if(_.has(process.env, 'search_indexing_queue_url')){
				
				if(_.has(entity, 'index_action') && _.contains(['add', 'delete'], entity.index_action)){
				
					if(_.has(entity, 'entity_type')){
						
						if(_.contains(this.indexing_entities, entity.entity_type)){
				
							let abridged_entity = this.createAbridgedEntity(entity);
				
							let abridged_entity_string = JSON.stringify(abridged_entity);
				
							sqs.sendMessage({message_body: abridged_entity_string, queue_url: process.env.search_indexing_queue_url}, (error, data) => {
				
								if(_.isError(error)){ return reject(error); }
								
								du.debug('Message sent to the queue.');
								
								return resolve(true);

							});
							
						}else{
							
							du.debug('This is not a indexed entity type.');
							// We don't need to index this thing.  Succeed quietly.	
							return resolve(false);
							
						}
					
					}else{
					
						return reject(new Error('Indexable entities must have a "Entity Type".'));
					
					}
					
				}else{
				
					return reject(new Error('Indexable entities must have a "index_action" which is either "add" or "delete".'));
					
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
	
	parseMessage(message){
		
		if(_.has(message, 'Body')){
		
			return JSON.parse(message.Body);
		
		}
		
		throw new Error('Unable to acquire message body.');
		
	}
	
	assureSuggestorFields(processed_document){
		
		if(!_.has(processed_document, 'name')){
			
			let name = '';
			
			if(_.has(processed_document, 'firstname') || _.has(processed_document, 'lastname')){
				
				if(_.has(processed_document, 'firstname')){
					name += processed_document.firstname;
				}
				
				if(_.has(processed_document, 'lastname')){
					if(name.length > 0){ name += ' '; }
					name += processed_document.lastname;
				}
				
			}else if(_.has(processed_document, 'trackingnumber')){
			
				name = processed_document.trackingnumber;
				
			}else if(_.has(processed_document, 'alias')){
			
				name = processed_document.alias;
				
			}
			
			processed_document['name'] = name;
			
		}
		
		return processed_document;
		
	}
	
	createIndexingDocument(documents_array){
		
		du.debug('Creating Indexing Document', documents_array);
		
		let response = [];
		let adds = [];
		let deletes = [];
		
		documents_array.forEach((document) => {
			
			let parsed_document = this.parseMessage(document);
			
			du.debug('Parsed Document', parsed_document);
			
			if(_.has(parsed_document, 'index_action') && _.contains(['add','delete'], parsed_document.index_action) && _.has(parsed_document, 'id')){		
				
				let processed_document = {};
				
				for(var k in parsed_document){
					
					if(_.contains(['index_action','id'], k)){
						
						if(k == 'index_action'){
							
							processed_document['type'] = parsed_document[k];
							
						}else{
						
							processed_document[k] = parsed_document[k];
							
						}
						
					}else{
					
						if(!_.has(processed_document, 'fields')){
						
							processed_document.fields = {};
							
						}
						
						if(_.isString(document[k])){
							processed_document.fields[k] = parsed_document[k];
						}else{
							processed_document.fields[k] = JSON.stringify(parsed_document[k]);
						}
						
					}
					
				}
				
				processed_document = this.assureSuggesterFields(processed_document);
				
				if(processed_document.index_action == 'add'){
					adds.push(processed_document);
				}else{
					deletes.push(processed_document);
				}

			}
			
		});
		
		if(adds.length > 0){
			response = response.concat(adds);
		}
		if(deletes.length > 0){
			response = response.concat(deletes);
		}
		
		return JSON.stringify(response);
		
	}
	
}	

var iu = new IndexingUtilities();

module.exports = iu;