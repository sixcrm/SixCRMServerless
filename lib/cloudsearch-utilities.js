'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class CloudSearchUtilities {
	
	constructor(stage){
		
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
		
	}
	
	uploadDocuments(structured_documents){
		
		return new Promise((resolve, reject) => {
		
			let params = {
				contentType: 'application/json',
				documents: structured_documents
			};
		
			this.csd.uploadDocuments(params, function(error, data){ 
				if(error){  return reject(error); }
				return resolve(data);
			});
			
		});
		
	}
	
}

var csu = new CloudSearchUtilities(process.env.stage);
module.exports = csu;