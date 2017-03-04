'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
var fs = require('fs');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

let dynamoutilities = require('../lib/dynamodb-utilities.js');
let arrayutilities = require('../lib/array-utilities.js');
let permissionutilities = require('../lib/permission-utilities.js');

//Technical Debt:  This controller needs a "hydrate" method or prototype

module.exports = class entityController {
	
	constructor(table_name, descriptive_name){
		this.table_name = table_name;
		this.descriptive_name = descriptive_name;
		this.nonaccounts = ['user', 'role', 'accesskey', 'account', 'fulfillmentprovider'];
	}
	
	can(action){	
		
		return permissionutilities.validatePermissions(action, this.descriptive_name);
		
	}
	
	//ACL enabled
	list(cursor, limit){
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
			
				if(permission != true){
				
					resolve(null);
				
				}

				var query_parameters = {filter_expression: null, expression_attribute_values: null};
			
				if(typeof cursor  !== 'undefined'){
					query_parameters.ExclusiveStartKey = { id: cursor };
				}
   
				if(typeof limit  !== 'undefined'){
					query_parameters['limit'] = limit;
				}
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv'
						query_parameters.expression_attribute_values = {':accountv':global.account};
					
					}
				
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
			
		});
		
	}

	//ACL enabled
	listBySecondaryIndex(field, index_value, index_name, cursor, limit){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
			
				if(permission != true){
				
					resolve(null);
				
				}
			
				let query_parameters = {
					condition_expression: field+' = :index_valuev',
					expression_attribute_values: {':index_valuev': index_value}
				}
			
				if(typeof cursor  !== 'undefined'){
					query_parameters.ExclusiveStartKey = cursor;
				}

				if(typeof limit  !== 'undefined'){
					query_parameters['limit'] = limit;
				}
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv'
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
			
				dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {
				
					if(_.isError(error)){ 
						console.log('listBySecondaryIndex failed with error: ', error)
						reject(error);
					}
				
					if(_.isArray(data) && data.length > 0){
					
						resolve(data);
					
					}else{
				
						resolve(null);
					
					}				
	
				});
			
			});
		
		});
        
	}

	//ACL enabled
	getBySecondaryIndex(field, index_value, index_name, cursor, limit){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
			
				if(permission != true){ resolve(null); }
				
				let query_parameters = {
					condition_expression: field+' = :index_valuev',
					expression_attribute_values: {':index_valuev': index_value},
				}
			
				if(typeof cursor  !== 'undefined'){
					query_parameters.ExclusiveStartKey = cursor;
				}

				if(typeof limit  !== 'undefined'){
					query_parameters['limit'] = limit;
				}
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv'
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
					
				dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {
				
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
			
        });
        
	}

	//ACL enabled
	get(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
			
				if(permission != true){ resolve(null); }
				
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': id}
				};
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv';
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
			
				dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {
					
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
			
        });
        
    }
    
    //ACL enabled
    create(entity){

		return new Promise((resolve, reject) => {
			
			this.can('create').then((permission) => {
			
				if(permission != true){ resolve(null); }
				
				if(!_.has(entity,'id')){
			
					entity.id = uuidV4();
				
				}
			
				if(_.has(global, 'account')){
				
					if(!arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
						entity.account = global.account;
					
					}
				
				}
			
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': entity.id}
				};
			
				if(_.has(global, 'account')){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv';
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
			
				dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {
				
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
			
		});
		
	}

	//ACL enabled
	update(entity){
		
		return new Promise((resolve, reject) => {
			
			this.can('update').then((permission) => {
			
				if(permission != true){ resolve(null); }
				
				if(_.has(global, 'account')){
				
					if(!arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
			
						entity.account = global.account;
				
					}
			
				}
			
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': entity.id}
				};
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv';
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
			
				dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {
				
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
			
		});
		
	}

	//NOT ACL enabled
	delete(id){
		
		return new Promise((resolve, reject) => {
			
			this.can('update').then((permission) => {
			
				if(permission != true){ resolve(null); }
				
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': id}
				};
			
				let delete_parameters = {id:id};
			
				if(_.has(global, 'account') && !arrayutilities.inArray(this.descriptive_name, this.nonaccounts)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv';
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}

			
				dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {
				
					if(_.isError(error)){ reject(error);}
				
					if(_.isObject(data) && _.isArray(data) && data.length == 1){
				
						dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null, (error, data) => {
			
							if(_.isError(error)){ reject(error);}
				
							resolve({ id });
				
						});
					
					}else{
					
						reject(new Error('Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.'));
					
					}
				
				});
			
			});
			
		});
			
	}

	//ACL enabled
	validate(object, object_type){
		
		return new Promise((resolve, reject) => {
			
			if(typeof object_type == 'undefined'){
				var object_type = this.descriptive_name;
			}
			
			var v = new Validator();
		
			var schema;
		
			try{

				schema = require('../model/'+object_type);

			} catch(e){

				return reject(new Error('Unable to load validation schema for '+object_type));

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