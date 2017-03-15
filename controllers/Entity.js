'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
var fs = require('fs');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

const dynamoutilities = require('../lib/dynamodb-utilities.js');
const permissionutilities = require('../lib/permission-utilities.js');
const du = require('../lib/debug-utilities.js');
const sqs = require('../../lib/sqs-utilities.js');

//Technical Debt:  This controller needs a "hydrate" method or prototype

module.exports = class entityController {
	
	constructor(table_name, descriptive_name){
		this.table_name = table_name;
		this.descriptive_name = descriptive_name;
		this.nonaccounts = ['user', 'role', 'accesskey', 'account', 'fulfillmentprovider'];
	}
	
	can(action){	
		
		du.debug('Can check:', action, this.descriptive_name);
		
		return new Promise((resolve, reject) => {
		
			permissionutilities.validatePermissions(action, this.descriptive_name).then((permission) => {
				
				du.debug('Has permission:', permission);
				
				return resolve(permission);
				
			}).catch((error) => {
				
				du.debug(error);
				
				return reject(error);
				
			});
		
		});
		
	}
	
	//ACL enabled
	list(cursor, limit){
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
				
				if(permission != true){
					
					return resolve(null);
					//resolve(permissionutilities.messages.nopermission); 
				
				}				
				
				var query_parameters = {filter_expression: null, expression_attribute_values: null};

				if(typeof cursor  !== 'undefined'){
					query_parameters.ExclusiveStartKey = { id: cursor };
				}

				if(typeof limit  !== 'undefined'){
					query_parameters['limit'] = limit;
				}
					
				if(global.disableaccountfilter !== true){
								
					if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
					
					
						if(global.account == '*'){

							//for now, do nothing
					
						}else{
						
							query_parameters.filter_expression = 'account = :accountv';
							query_parameters.expression_attribute_values = {':accountv':global.account};
					
						}
				
					}
				
				}else{
				
					du.warning('Global Account Filter Disabled');
					
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
		
		du.debug('Listing by secondary index', field, index_value, index_name);
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.can('read').then((permission) => {
				
				if(permission !== true){
				
					return resolve(null);
				
				}
			
				let query_parameters = {
					condition_expression: '#'+field+' = :index_valuev',
					expression_attribute_values: {':index_valuev': index_value},
					expression_attribute_names: {}
				}
				
				query_parameters.expression_attribute_names['#'+field] = field;
				
				if(typeof cursor  !== 'undefined'){
					query_parameters.ExclusiveStartKey = cursor;
				}

				if(typeof limit  !== 'undefined'){
					query_parameters['limit'] = limit;
				}
				
				if(global.disableaccountfilter !== true){
				
					if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
				
						if(global.account == '*'){
					
							//for now, do nothing
					
						}else{
				
							query_parameters.filter_expression = 'account = :accountv';
							query_parameters.expression_attribute_values[':accountv'] = global.account;
					
						}
				
					}
				
				}else{
				
					du.warning('Global Account Filter Disabled');
					
				}
				
				du.debug(query_parameters);
				
				dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {
					
					if(_.isError(error)){ 

						return reject(error);
						
					}
				
					if(_.isArray(data) && data.length > 0){
					
						return resolve(data);
					
					}else{
				
						return resolve(null);
					
					}				
	
				});
			
			});
		
		});
        
	}

	//ACL enabled
	getBySecondaryIndex(field, index_value, index_name, cursor, limit){
		
		du.highlight('here');
		
		var controller_instance = this;
		
		du.debug(Array.from(arguments));
		
		return new Promise((resolve, reject) => {	
			
			this.can('read').then((permission) => {
				
				if(permission != true){ 
					
					return resolve(null);
						
				}
				
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
				
				if(global.disableaccountfilter !== true){
				
					if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
				
						if(global.account == '*'){
					
							//for now, do nothing
					
						}else{
				
							query_parameters.filter_expression = 'account = :accountv';
							query_parameters.expression_attribute_values[':accountv'] = global.account;
					
						}
				
					}
				
				}else{
					
					du.warning('Global Account Filter Disabled');
					
				}
				
				du.debug(query_parameters);
				
				dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {
					
					if(_.isError(error)){ reject(error);}
				
					if(_.isArray(data)){
					
						if(data.length == 1){
					
							return resolve(data[0]);
					
						}else{
						
							if(data.length > 1){
							
								return reject(new Error('Multiple '+this.descriptive_name+'s returned where one should be returned.'));
							
							}else{
								
								return resolve(null);
							
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
					
				if(permission != true){
				
					resolve(null);
				
				}
				
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': id}
				};
				
				if(global.disableaccountfilter !== true){
				
					if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
				
						if(global.account == '*'){
					
							//for now, do nothing
					
						}else{
				
							query_parameters.filter_expression = 'account = :accountv';
							query_parameters.expression_attribute_values[':accountv'] = global.account;
					
						}
				
					}
				
				}else{
					
					du.warning('Global Account Filter Disabled');
					
				}
			
				dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {
					
					if(_.isError(error)){ 
						
						du.warning(error);
													
						reject(error);
					
					}
				
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
    
    //Technical Debt:  Could a user authenticate using his credentials and create an object under a different account (aka, account specification in the entity doesn't match the account)
    //ACL enabled
    create(entity){
		
		return new Promise((resolve, reject) => {
			
			this.can('create').then((permission) => {
				
				if(permission != true){ 
				
					return resolve(null);
									
				}else{
				
					if(!_.has(entity,'id')){
			
						entity.id = uuidV4();
				
					}
					
					if(!_.has(entity, 'account') && _.has(global, 'account')){
				
						if(!_.contains(this.nonaccounts, this.descriptive_name)){
				
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
				
						if(_.isError(error)){ 
							
							reject(error);
						
						}

						if(_.isObject(data) && _.isArray(data) && data.length > 0){

							return reject(new Error('A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"'));
					
						}				

						dynamoutilities.saveRecord(this.table_name, entity, (error, data) => {		

							if(_.isError(error)){ reject(error);}

							return resolve(entity);
				
						});
			
					});	
					
				}	
				
			});
			
		});
		
	}
	
	//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
	//ACL enabled
	update(entity){
		
		return new Promise((resolve, reject) => {
			
			this.can('update').then((permission) => {
			
				if(permission != true){ 
					
					resolve(null);
					
				}
				
				if(_.has(global, 'account')){
				
					if(!_.contains(this.nonaccounts, this.descriptive_name)){
			
						entity.account = global.account;
				
					}
			
				}
			
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': entity.id}
				};
			
				if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
				
					if(global.account == '*'){
					
						//for now, do nothing
					
					}else{
				
						query_parameters.filter_expression = 'account = :accountv';
						query_parameters.expression_attribute_values[':accountv'] = global.account;
					
					}
				
				}
				
				du.debug('Update query validation', this.table_name, query_parameters);
			
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
			
				if(permission != true){ 
				
					resolve(null);
					
				}
				
				let query_parameters = {
					condition_expression: 'id = :idv',
					expression_attribute_values: {':idv': id}
				};
			
				let delete_parameters = {id:id};
			
				if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){
				
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
		
		du.debug('Validating:', object_type, object);
		
		return new Promise((resolve, reject) => {
			
			du.debug(object_type);
			
			if(!_.isString(object_type)){
				
				du.debug('Is not a string: ', object_type);
				
				var object_type = this.descriptive_name;
				
			}
			
			var v = new Validator();
		
			var schema;
		
			try{
				
				let schema_path = '../model/'+object_type;
				
				du.debug('Schema path: '+schema_path);
				
				schema = require(schema_path);

			} catch(e){
				
				du.warning(e);
				return reject(new Error('Unable to load validation schema for '+object_type));

			}
			
			du.debug('Validation Schema loaded');
			
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
	
	isUUID(string, version){
		
		if(_.isString(string)){
			return validator.isUUID(string, version);
		}
		return false;
		
	}
	
	isEmail(string){
		
		if(_.isString(string)){
			return validator.isEmail(string);	
		}
		return false;
		
	}
	
	disableACLs(argument){
	
		//Technical Debt:  This function isn't scoped to the child class unless we provide the argument
		
		du.warning('Disabling ACLs');
		
		global.disableactionchecks = true;
		global.disableaccountfilter = true;
		
		return;
		
	}
	
	enableACLs(argument){
	
		//Technical Debt:  This function isn't scoped to the child class unless we provide the argument
		
		du.warning('Re-Enabling ACLs');
		
		global.disableactionchecks = false;
		global.disableaccountfilter = false;
		
		return;
		
	}

	unsetGlobalUser(){
	
		global.user = undefined;
		
	}
	
	setGlobalUser(user){
		
		du.debug('Setting global user:', user);
							
		if(_.has(user, 'id') || this.isEmail(user)){
		
			global.user = user;
			
		}
							
	}
	
	acquireGlobalUser(){
		
	}
	
	removeFromSearchIndex(entity){
	
		return indexingutilities.removeFromSearchIndex(entity);
		
	}
	
	addToSearchIndex(entity, entity_type){
		
		entity.entity_type = entity_type;
		
		return indexingutilities.addToSearchIndex(entity);
		
	}
	
}