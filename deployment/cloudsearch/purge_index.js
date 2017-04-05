"use strict"
const _ = require('underscore');
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');

du.highlight('Executing CloudSearch Index Purge');

let query_parameters = {
	queryParser: 'structured',
	query: 'matchall',
	size: '10000'
};

cloudsearchutilities.search(query_parameters).then((results) => {
	
	let purge_doc = [];
	
	if(_.has(results, 'hits')){
		
		if(_.has(results.hits, 'found')){
		
			du.highlight('Removing '+results.hits.found+' documents');
			
		}else{
			
			throw new Error('Unable to identify found count in search results.');
			
		}
		
		if(_.has(results.hits, 'hit') && _.isArray(results.hits.hit)){
		
			results.hits.hit.forEach((hit) => {
				
				purge_doc.push('{"type": "delete", "id": "'+hit.id+'"}');
		
			});
		
		}else{
			
			throw new Error('Unable to identify hit property in search results hits.');
			
		}
		
	}else{
		
		throw new Error('Unable to identify hits property in search results.');
		
	}
	
	if(purge_doc.length > 0){
	
		return '['+purge_doc.join(',')+']';
		
	}else{
		
		return false;
		
	}
	
}).then((purge_doc) => {
	
	if(purge_doc == false){
		
		du.highlight('No documents to purge.');
		
	}else{
	
		cloudsearchutilities.uploadDocuments(purge_doc).then((response) => {
		
			du.highlight('Purge Response: ', response);
	
		});
		
	}
	
}).catch((error) => {

	throw new Error(error);
	
});