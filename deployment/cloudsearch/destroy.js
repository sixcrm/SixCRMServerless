"use strict"
const AWS = require("aws-sdk");
const _ = require('underscore');
const fs = require('fs');
const yaml = require('js-yaml');

const du = require('../../lib/debug-utilities.js');

let cs = new AWS.CloudSearch({
	region: 'us-east-1', 
	apiVersion: '2013-01-01'
});

let environment = process.argv[2];
let domain_name = 'sixcrm-'+environment;

du.highlight('Executing CloudSearch Deletion: '+domain_name);

getDomainNames()
	.then(deleteDomain())
	.then(() => {
		du.highlight('Complete');
	}).catch((error) => {
		throw new Error(error);
	});

function deleteDomain(domain_array){
	
	du.debug('Delete Domain');
	
	return new Promise((resolve, reject) => {
		
		if(_.contains(domain_array, domain_name)){
		
			var params = {
				DomainName: domain_name
			};
		
			let delete_handle = cs.deleteDomain(params, (error, data) => {
				
				if(error){ return reject(error); }
				
				return resolve(data);
			
			});
			
		}else{
			
			du.debug('Domain name doesn\'t exist in this region.');
			
			return resolve(true);
			
		}
		
	});
	
}

function getDomainNames(){
	
	du.debug('Get Domain Names');
	
	return new Promise((resolve, reject) => {
		
		let domain_names = [];
		
		cs.listDomainNames((error, data) => {
		
			if(error){ return reject(error); }
			
			if(_.has(data, 'DomainNames')){
				
				for(var property in data.DomainNames){
				
					domain_names.push(property);
					
				}
				
				return resolve(domain_names);
				
			}	
		
		});
		
	});
	
}
