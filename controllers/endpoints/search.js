'use strict';
const _ = require("underscore");
const request = require('request');
const querystring = require('querystring');

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');

var endpointController = require('./endpoint.js');

class searchController {
	
	constructor(){

	}
	
	search(search_input){
		
		return this.retrieveResults(search_input).then((results) => this.flattenResults(results));
		
	}
	
	retrieveResults(search_input){
		
		return new Promise((resolve, reject) => {
			
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