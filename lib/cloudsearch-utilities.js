'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class CloudSearchUtilities {
	
	constructor(){
		
		//Technical Debt:  This all needs to be configured
		
		this.domain_name = 'sixcrm';
		this.cs = new AWS.CloudSearch({
			region: 'us-east-1', 
			apiVersion: '2013-01-01'
		});
		
		this.cloudsearchdomain_endpoint = 'doc-sixcrm-x5xewjrr254yjyrln4mlvxvfm4.us-east-1.cloudsearch.amazonaws.com';
		this.csd = new AWS.CloudSearchDomain({
			region: 'us-east-1',
			apiVersion: '2013-01-01',
			endpoint: this.cloudsearchdomain_endpoint
		});
		
		this.search_fields = [
			'query', 
			'cursor', 
			'expr', 
			'facet', 
			'filterQuery', 
			'highlight', 
			'partial',
			'queryOptions',
			'queryParser', 
			'return', 
			'size', 
			'sort', 
			'start', 
			'stats'
		];
		
		this.suggest_fields = [
			'query',
			'suggester',
			'size'
		];
	}
	
	search(search_parameters){
		
		return new Promise((resolve, reject) => {
		
			du.warning(search_parameters);
			
			let params = {};
			
			for(var k in search_parameters){
				if(_.contains(this.search_fields, k)){
					params[k] = search_parameters[k];
				}
			}
			
			this.csd.search(params, function(error, data) {
				
				if (error){ 
				
					return reject(error);
					
				}else{     
					
					du.debug('Raw search results:', data);
					
					return resolve(data);
					
				}
				
			});
			
		});
		
	}
	
	suggest(suggest_parameters){
		
		return new Promise((resolve, reject) => {

			du.warning(suggest_parameters);
			
			let params = {};
			
			for(var k in suggest_parameters){
				if(_.contains(this.suggest_fields, k)){
					params[k] = suggest_parameters[k];
				}
			}
			
			this.csd.suggest(params, function(error, data) {
				
				if (error){ 
					return reject(error);
				}else{     
					return resolve(data);
				}
				
			});
			
		});
		
	}
	
	uploadDocuments(structured_documents){
		
		du.debug('Uploading documents to Cloudsearch', structured_documents);
		
		return new Promise((resolve, reject) => {
			
			let params = {
				contentType: 'application/json',
				documents: structured_documents
			};
			
			du.debug('Cloudsearch Parameters', params);
			
			this.csd.uploadDocuments(params, function(error, data){ 
				if(error){  
					du.warning('Cloudsearch error: ', error);
					return reject(error); 
				}
				du.debug('Successful Indexing:', data);
				return resolve(data);
			});
			
		});
		
	}
	
}

var csu = new CloudSearchUtilities(process.env.stage);
module.exports = csu;