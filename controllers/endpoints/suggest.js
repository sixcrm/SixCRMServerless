'use strict';
const _ = require("underscore");
const request = require('request');
const querystring = require('querystring');

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');

var endpointController = require('./endpoint.js');

class suggestController extends endpointController {
	
	constructor(){
		super();
	}
	
	execute(event){
		
		du.debug('Executing Suggest', event);
		
		return this.parseEvent(event)
			.then((event) => this.acquireSuggestTerms(event))
			//.then((event) => this.acquireAccount(event))
			//.then((event) => this.setGlobalAccount(event))
			//.then((event) => this.acquireUser(event))
			//.then((event) => this.retrieveAndSetGlobalUser(event))
			.then((event) => this.suggest(event));
			
	}	
	
	acquireSuggestTerms(event){
		return new Promise((resolve, reject) => {
			du.debug('Event:', event);
			if(_.isString(event.body)){
				let suggest_parameters = JSON.parse(event.body);
				event.suggest_parameters = suggest_parameters;
			}
			resolve(event);
		});
	}
	
	suggest(event){
		
		return new Promise((resolve, reject) => {
			
			du.debug(event.suggest_parameters);
			
			cloudsearchutilities.suggest(event.suggest_parameters).then((results) => {
				
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

module.exports = new suggestController();