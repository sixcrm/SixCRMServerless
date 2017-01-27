'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');

class AccessKeyController {

	constructor(){
	
	}
	
	getAccessKeyByID(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.access_keys_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for accesskey ID.'));
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
	listAccessKeys(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.access_keys_table, query_parameters, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data)){
					
					var pagination_object = {
						count: '',
						end_cursor: '',
						has_next_page: 'false'
					}
					
					if(_.has(data, "Count")){
						pagination_object.count = data.Count;
					}
					
					if(_.has(data, "LastEvaluatedKey")){
						if(_.has(data.LastEvaluatedKey, "id")){
							pagination_object.end_cursor = data.LastEvaluatedKey.id;
						}
					}
					
					var has_next_page = 'false';
					if(_.has(data, "LastEvaluatedKey")){
						pagination_object.has_next_page = 'true';
					}
					
					resolve(
						{
							accesskeys: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
	}
	
	getAccessKey(access_key){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.access_keys_table, 'access_key = :access_keyv', {':access_keyv': access_key}, 'access_key-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for accesskey.'));
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
}

module.exports = new AccessKeyController();
