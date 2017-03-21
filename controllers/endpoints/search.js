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
	
	
	respond(event){
		return new Promise((resolve, reject) => {
			return resolve(true);
		});
	}
	
}

module.exports = new searchController();