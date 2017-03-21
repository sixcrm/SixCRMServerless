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
		
		return new Promise((resolve, reject) => {
			
			cloudsearchutilities.search(search_input).then((results) => {
				
				du.highlight(results);
				
				return resolve(results);
				
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
		
	}
	
}

module.exports = new searchController();