'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var sqsutilities = require('../lib/sqs-utilities.js');
var timestamp = require('../lib/timestamp.js');

class RebillController {

	constructor(){
	
	}
	
	getProducts(rebill){
		
		var productController = require('./Product.js');
		
		return rebill.products.map(id => productController.getProduct(id));
        
	}
	
	getParentSession(rebill){
		
		var sessionController = require('./Session.js');
		
		var id = rebill.parentsession;
		
		return sessionController.getSession(id);
		
	}
	
	listRebills(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(process.env.rebills_table, query_parameters, (error, data) => {
				
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
							rebills: data.Items,
							pagination: pagination_object
						}
					);
					
				}
	
			});
			
		});
		
	}
	
	getRebill(id){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.rebills_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
						resolve(data[0]);
					}else{
						if(data.length > 1){
							reject(new Error('multiple rebills returned where one should be returned.'));
						}else{
							resolve([]);
						}
						
					}
					
				}
				
			});
			
        });
        
    }
        
	getRebillsBySessionID(id){

		return new Promise((resolve, reject) => {
		
			dynamoutilities.queryRecords(process.env.rebills_table, 'parentsession = :parentsessionv', {':parentsessionv': id}, 'parentsession-index', (error, data) => {
			
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){

					resolve(data);
					
				}
	
			});
	
		});
		
	}
	
	markRebillProcessing(rebill){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.updateRecord(process.env.rebills_table, {'id': rebill.id}, 'set processing = :p', {":p": "true"}, (error, data) => {
				
				if(_.isError(error)){
					reject(error);
				}
			
				rebill.processing = "true";
	
				resolve(rebill);
					
			});
	
		});
		
	}
	
	getRebillsAfterTimestamp(timestamp){
		
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: 'billdate < :timestampv AND processing <> :processingv', expression_attribute_values: {':timestampv':timestamp, ':processingv':'true'}};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecords(process.env.rebills_table, query_parameters, (error, data) => {

				if(_.isError(error)){ 
					reject(error);
				}
				
				if(_.isArray(data)){
					resolve(data);
				}
	
			});
	
		});
		
	}
	
	sendMessageAndMarkRebill(rebill){

		return new Promise((resolve, reject) => {
			
			sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue_url: process.env.bill_queue_url}, (error, data) =>{
				
				if(_.isError(error)){ reject(error);}
				
				this.markRebillProcessing(rebill).then((rebill) => {
			
					resolve(rebill);
					
				}).catch((error) => {
				
					reject(error);
				
				});
			
			});
	
		});
		
	}
		
}

module.exports = new RebillController();
