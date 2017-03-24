'use strict';
const _ = require("underscore");
const request = require('request');
const querystring = require('querystring');

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');
const permissionutilities = require('../../lib/permission-utilities.js');

var endpointController = require('./endpoint.js');

class searchController {
	
	constructor(){
		
		//Technical Debt:  This needs to be configured.
		this.entity_types = {
			product: 'product', 
			campaign: 'campaign', 
			creditcard: 'credit_card', 
			customer: 'customer', 
			productschedule: 'product_schedule', 
			merchantprovider: 'merchant_provider',
			shippingreceipt: 'shipping_receipt',
			transaction: 'transaction'
		};
		
	}
	
	search(search_input){
		
		return this.retrieveResults(search_input).then((results) => this.flattenResults(results));
		
	}
	
	appendFilters(search_input){
		
		return new Promise((resolve, reject) => {
		
			let promises = [];
			promises.push(this.createAccountFilter());
			promises.push(this.createActionFilter());
			
			Promise.all(promises).then((promises) => {
				
				let account_filter = promises[0];
				let action_filter = promises[1];
				
				du.debug('account_filter', account_filter);
				du.debug('action_filter', action_filter);
				
				search_input['filterQuery'] = '(and '+account_filter+' '+action_filter+')';
				du.highlight('Search Input with filters', search_input);
				//assemble these.
				return resolve(search_input);
				
			});
			
		});
		
	}
	
	createActionFilter(){
		
		du.debug('Append Action Filter');
		
		return new Promise((resolve, reject) => { 
			
			let promises = [];
			
			for(var key in this.entity_types){
			
				promises.push(permissionutilities.validatePermissions('read', key));
			
			}
			
			Promise.all(promises).then((promises) => {
				
				let entity_type_keys = Object.keys(this.entity_types);
				
				let action_filters = [];
				
				for(var i in promises){
					if(promises[i]){
						action_filters.push('(term field=entity_type \''+this.entity_types[entity_type_keys[i]]+'\')');
					}
				}
				
				du.warning(action_filters);
				
				let action_filter = '(or '+action_filters.join('')+')';	
				
				return resolve(action_filter);			
	
			});
				
		});
		
	}
	
	createAccountFilter(){
		
		du.debug('Create Account Filter.');
		
		return new Promise((resolve, reject) => {	
		
			let account_filter = false;
		
			if(_.has(global, 'account') && global.account !== '*'){
	
				account_filter = '(term field=account \''+global.account+'\')';
		
			}
	
			du.debug('Account Filter:', account_filter);
	
			return resolve(account_filter);
		
		});
			
	}
	
	retrieveResults(search_input){
		
		return new Promise((resolve, reject) => {
			
			this.appendFilters(search_input).then((search_input) => {
				
				cloudsearchutilities.search(search_input).then((results) => {
				
					du.highlight(results);
				
					results = this.flattenResults(results);
				
					du.highlight('Flattened Results', results);
				
					return resolve(results);
				
				}).catch((error) => {
				
					du.warning('Search Error: '+error);
				
					return reject(error);
				
				});
			
			});
			
		});
		
	}
	
	flattenResults(results){
		
		return new Promise((resolve, reject) => {
		
			du.debug('Flattening Search Results');
		
			if(_.has(results, 'hits') && _.has(results.hits, 'hit') && _.isArray(results.hits.hit)){
			
				let flattened_hits = []
			
				results.hits.hit.forEach((result) => {
					
					var flattened_hit = {id:null, fields:{}};
				
					for(var k in result){
						
						if(k != 'fields'){
							
							
							flattened_hit[k] = result[k];
						
						}else{
							
							for(var j in result[k]){
								
								if(_.isArray(result[k][j])){
								
									if(result[k][j].length == 1){
										
										flattened_hit.fields[j] = result[k][j][0].replace (/(^")|("$)/g, '');
										
									}else{
										
										flattened_hit.fields[j] = result[k][j];
										
									}
									
								}else{
								
									flattened_hit.fields[j] = result[k][j];
									
								}
											
							}
						
						}
					
					}
				
					flattened_hits.push(flattened_hit);
				
				});
			
				results.hits['hit'] = flattened_hits;
			
			}
			
			du.debug('Flattened Results', results);
			
			return resolve(results);
		
		});
		
	}
	
}

module.exports = new searchController();