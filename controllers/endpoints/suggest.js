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
	
	suggest(suggestion_parameters){
		
		return new Promise((resolve, reject) => {
			
			du.debug(suggestion_parameters);
			
			cloudsearchutilities.suggest(suggestion_parameters).then((results) => {
				
				return resolve(results);
				
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
		
	}
	
}

module.exports = new suggestController();