'use strict';
const _ = require("underscore");
const request = require('request');
const querystring = require('querystring');

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');

var endpointController = require('./endpoint.js');

class searchController extends endpointController {
	
	constructor(){
		super();
	}
	
	execute(event){
		
		du.debug('Executing Search', event);
		
		return this.parseEvent(event)
			.then((event) => this.acquireSearchTerms(event))
			//.then((event) => this.acquireAccount(event))
			//.then((event) => this.setGlobalAccount(event))
			//.then((event) => this.acquireUser(event))
			//.then((event) => this.retrieveAndSetGlobalUser(event))
			.then((event) => this.search(event));
			
	}	
	
	acquireSearchTerms(event){
		return new Promise((resolve, reject) => {
			du.debug('Event:', event);
			if(_.isString(event.body)){
				let search_parameters = JSON.parse(event.body);
				event.search_parameters = search_parameters;
			}
			resolve(event);
		});
	}
	
	//Technical Debt:  Rebuild this
	/*
	search(event){
	
		return new Promise((resolve, reject) => {
		
			let search_uri = this.buildSearchURI(event);
			
			du.debug('Search Endpoint', search_uri);
			
			request(search_uri, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					return resolve(JSON.parse(body));
				}
				return reject({error, body});
			});
			
		});
		
	}	
	*/
	
	search(event){
		
		return new Promise((resolve, reject) => {
			
			du.debug(event.search_parameters);
			
			cloudsearchutilities.search(event.search_parameters).then((results) => {
				
				return resolve(results);
				
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
		
	}
	
	/*
	buildSearchURI(event){
		
		let qs = querystring.encode(event.search_parameters);
		
		//Technical Debt:  This should be configured...
		let endpoint = 'http://search-sixcrm-x5xewjrr254yjyrln4mlvxvfm4.us-east-1.cloudsearch.amazonaws.com/2013-01-01/search?'+qs;
		
		du.debug('Query Endpoint: ', endpoint);
	
		return endpoint;
		
	}
	*/
	
	respond(event){
		return new Promise((resolve, reject) => {
			return resolve(true);
		});
	}
	
}

module.exports = new searchController();