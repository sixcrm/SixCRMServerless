'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
var fs = require('fs');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

var dynamoutilities = require('../lib/dynamodb-utilities.js');

//Technical Debt:  This controller needs a "hydrate" method or prototype
module.exports = class entityController {
	
	constructor(table_name, descriptive_name){
		this.table_name = table_name;
		this.descriptive_name = descriptive_name;
	}
	
	list(cursor, limit){
	
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = { id: cursor };
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data)){
					
					var pagination_object = {
						count: '',
						end_cursor: '',
						has_next_page: 'true'
					}
					
					if(_.has(data, "Count")){
						pagination_object.count = data.Count;
					}
					
					if(_.has(data, "LastEvaluatedKey")){
						if(_.has(data.LastEvaluatedKey, "id")){
							pagination_object.end_cursor = data.LastEvaluatedKey.id;
						}
					}
					
					if(!_.has(data, "LastEvaluatedKey")  || (_.has(data, "LastEvaluatedKey") && data.LastEvaluatedKey == null)){
						pagination_object.has_next_page = 'false';
					}
					
					if(data.Items.length < 1){
						data.Items = null;
					}
					
					var resolve_object = {
							pagination: pagination_object
					};
					resolve_object[this.descriptive_name+'s'] = data.Items;
					
					resolve(resolve_object);
					
				}
	
			});
			
		});
		
	}
	
	//Technical Debt:  This may need to be rewritten...
	listBySecondaryIndex(field, index_value, index_name){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			/*
			Technical Debt:  These must be in place for listing...
			
			var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			*/
				
			var query = field+' = :index_valuev';
			
			dynamoutilities.queryRecords(this.table_name, query, {':index_valuev': index_value}, index_name, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data) && data.length > 0){
					
					resolve(data);
					
				}else{
				
					resolve(null);
					
				}				
	
			});
			
        });
        
	}
	
	getBySecondaryIndex(field, index_value, index_name){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			var query = field+' = :index_valuev';
					
			dynamoutilities.queryRecords(this.table_name, query, {':index_valuev': index_value}, index_name, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							
							reject(new Error('Multiple '+this.descriptive_name+'s returned where one should be returned.'));
							
						}else{
							
							resolve(null);
							
						}
					
					}
					
				}
	
			});
			
        });
	}
	
	get(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(this.table_name, 'id = :idv', {':idv': id}, null, (error, data) => {
					
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
										
					if(data.length == 1){

						resolve(data[0]);
							
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple '+this.descriptive_name+'s returned where one should be returned.'));
							
						}else{
							
							resolve(null);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
    
    create(entity){

		return new Promise((resolve, reject) => {
			
			if(!_.has(entity,'id')){
			
				entity.id = uuidV4();
				
			}
			
			dynamoutilities.queryRecords(this.table_name, 'id = :idv', {':idv': entity.id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}

				if(_.isObject(data) && _.isArray(data) && data.length > 0){

					reject(new Error('A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"'));
					
				}				

				dynamoutilities.saveRecord(this.table_name, entity, (error, data) => {		

					if(_.isError(error)){ reject(error);}

					resolve(entity);
				
				});
			
			});	
			
		});
		
	}
	
	update(entity){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.queryRecords(this.table_name, 'id = :idv', {':idv': entity.id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data) && data.length == 1){
					
					dynamoutilities.saveRecord(this.table_name, entity, (error, data) => {
			
						if(_.isError(error)){ reject(error);}
				
						resolve(entity);
				
					});
					
				}else{
					
					reject(new Error('Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist or multiples returned.'));
					
				}
			
			});		
				
		});
		
	}
	
	delete(id){
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.queryRecords(this.table_name, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data) && data.length == 1){
				
					dynamoutilities.deleteRecord(this.table_name, { id:id }, null, null, (error, data) => {
			
						if(_.isError(error)){ reject(error);}
				
						resolve({ id });
				
					});
					
				}else{
					
					reject(new Error('Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.'));
					
				}
				
			});
			
		});	
	}
	
	validate(object){
		
		return new Promise((resolve, reject) => {
		
			var v = new Validator();
		
			var schema;
		
			try{

				schema = require('../model/'+this.descriptive_name);

			} catch(e){

				return reject(new Error('Unable to load validation schema for '+this.descriptive_name));

			}

			var validation;

			try{
				var v = new Validator();
				validation = v.validate(object, schema);
			}catch(e){
				return reject(new Error('Unable to instantiate validator.'));
			}
			
			if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

				var error = {
					message: 'One or more validation errors occurred.',
					issues: validation.errors.map((e)=>{ return e.message; })
				};
				
				return reject(error);

			}
			
			return resolve(validation);
		
		});
		
	}
        
}