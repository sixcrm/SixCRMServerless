'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

const timestamp = require('../lib/timestamp.js');
const dynamoutilities = require('../lib/dynamodb-utilities.js');
const permissionutilities = require('../lib/permission-utilities.js');
const du = require('../lib/debug-utilities.js');
const indexingutilities = require('../lib/indexing-utilities.js');

//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.

module.exports = class entityController {

    constructor(table_name, descriptive_name){
        this.table_name = table_name;
        this.descriptive_name = descriptive_name;
        this.nonaccounts = ['user', 'role', 'accesskey', 'account', 'fulfillmentprovider','notificationsetting'];
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

    listBySecondaryIndex(field, index_value, index_name, cursor, limit){

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

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

							//update the query parameters here...

                return Promise.resolve(dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    if(_.isError(error)){
                        return reject(error);
                    }

                    if(_.isObject(data)){

                        var pagination_object = {
                            count: '',
                            end_cursor: '',
                            has_next_page: 'true'
                        }

											// Technical Debt: We should improve the way we validate the data, either by using dedicated
											// response objects, JSON schema validation or both.
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

                        if (!_.has(data, "Items") || (!_.isArray(data.Items))) {
                            return reject(new Error('Data has no items.'));
                        }

                        if(data.Items.length < 1){
                            data.Items = null;
                        }

                        var resolve_object = {
                            pagination: pagination_object
                        };

                        resolve_object[this.descriptive_name+'s'] = data.Items;

                        return resolve(resolve_object);

                    } else {
                        return reject(new Error('Data is not an object.'));
                    }

                }));

            });

        });

    }

		//ACL enabled
    list(cursor, limit){

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

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

                return Promise.resolve(dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    if(_.isError(error)){
                        return reject(error);
                    }

                    if(_.isObject(data)){

                        var pagination_object = {
                            count: '',
                            end_cursor: '',
                            has_next_page: 'true'
                        }

												// Technical Debt: We should improve the way we validate the data, either by using dedicated
												// response objects, JSON schema validation or both.
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

                        if (!_.has(data, "Items") || (!_.isArray(data.Items))) {
                            return reject(new Error('Data has no items.'));
                        }

                        if(data.Items.length < 1){
                            data.Items = null;
                        }

                        var resolve_object = {
                            pagination: pagination_object
                        };

                        resolve_object[this.descriptive_name+'s'] = data.Items;

                        return resolve(resolve_object);

                    } else {
                        return reject(new Error('Data is not an object.'));
                    }

                }));

            });

        });

    }

		//ACL enabled
    queryBySecondaryIndex(field, index_value, index_name, cursor, limit){

        du.debug('Listing by secondary index', field, index_value, index_name, cursor, limit);

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

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

                du.debug('Query Parameters: ', query_parameters);

                return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {

                    if(_.isError(error)){

                        return reject(error);

                    }

                    if(_.isArray(data) && data.length > 0){

                        return resolve(data);

                    }else{

                        return resolve(null);

                    }

                }));

            });

        });

    }

		//ACL enabled
    getBySecondaryIndex(field, index_value, index_name, cursor, limit){

        du.debug(Array.from(arguments));

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

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

                return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {

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

                }));

            });

        });

    }

		//ACL enabled
    get(id, primary_key){

        return new Promise((resolve, reject) => {

            if(_.isNull(primary_key) || _.isUndefined(primary_key)){ primary_key = 'id'; }

            return this.can('read').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }

                let query_parameters = {
                    condition_expression: primary_key+' = :primary_keyv',
                    expression_attribute_values: {':primary_keyv': id}
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

                return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                    if(_.isError(error)){

                        du.warning(error);

                        return reject(error);

                    }

                    if(_.isObject(data) && _.isArray(data)){

                        if(data.length == 1){

                            return resolve(data[0]);

                        }else{

                            if(data.length > 1){

                                reject(new Error('Multiple '+this.descriptive_name+'s returned where one should be returned.'));

                            }else{

                                return resolve(null);

                            }

                        }

                    }

                }));

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    touch(key){

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }

                return Promise.resolve(dynamoutilities.touchRecord(this.table_name, key, (error, data) => {

                    if(_.isError(error)){

                        du.warning(error);

                        return reject(error);

                    }

                    return resolve(data);

                }));

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    getByKey(key){

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }

                return Promise.resolve(dynamoutilities.get(this.table_name, key, (error, data) => {

                    if(_.isError(error)){

                        du.warning(error);

                        return reject(error);

                    }

                    if(_.isObject(data)){

                        if (_.has(data, "Item")) {
                        	resolve(data.Item);
                        } else {
                        	resolve(null);
                        }

                    }

                }));

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    countCreatedAfterBySecondaryIndex(date_time, field, index_name, cursor, limit) {

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission !== true){

                    return resolve(null);

                }

                let query_parameters = {
                    condition_expression: '#'+field+' = :index_valuev',
                    expression_attribute_values: {':index_valuev': global.user.id, ':createdv': date_time},
                    expression_attribute_names: {},
                    filter_expression: 'created_at > :createdv'
                };

                query_parameters.expression_attribute_names['#'+field] = field;

                if(typeof cursor  !== 'undefined') {
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

                            query_parameters.filter_expression += ' AND account = :accountv';
                            query_parameters.expression_attribute_values[':accountv'] = global.account;

                        }

                    }

                }else{

                    du.warning('Global Account Filter Disabled');

                }

                du.debug(query_parameters);

                return Promise.resolve(dynamoutilities.countRecords(this.table_name, query_parameters, index_name, (error, data) => {

                    if(_.isError(error)){

                        return reject(error);

                    }

                    return resolve({ count: data});

                }));

            });

        });
    }

    //Technical Debt:  Could a user authenticate using his credentials and create an object under a different account (aka, account specification in the entity doesn't match the account)
    //ACL enabled
    create(entity){

        return new Promise((resolve, reject) => {

            return this.can('create').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }else{

                    if(!_.has(entity,'id')){

                        entity.id = uuidV4();

                    }

										//if(!_.has(entity, 'account') && _.has(global, 'account')){
                    if(!_.has(entity, 'account')){

                        du.debug('No account specified in the entity record');

                        if(_.has(global, 'account')){

                            du.debug('Global account identified.  Appending to the entity.');

                            if(!_.contains(this.nonaccounts, this.descriptive_name)){

                                entity.account = global.account;

                            }

                        }else{

                            du.debug('No global account value available.');

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

                    return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                        if(_.isError(error)){

                            reject(error);
                            return;

                        }

                        if(_.isObject(data) && _.isArray(data) && data.length > 0){

                            return reject(new Error('A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"'));

                        }

                        entity = this.setCreatedAt(entity);

                        dynamoutilities.saveRecord(this.table_name, entity, (error, data) => {

                            if(_.isError(error)){ reject(error);}

                            this.addToSearchIndex(entity, this.descriptive_name).then((indexed) => {

                                return resolve(entity);

                            }).catch((error) => {

                                return reject(error);

                            });

                        });

                    }));

                }

            }).catch((error) => {
                return reject(error);
            });

        });

    }

		//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
		//ACL enabled
    update(entity){

        return new Promise((resolve, reject) => {

            return this.can('update').then((permission) => {

                if(permission != true){

                    return resolve(null);

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

                return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                    if(_.isError(error)){ reject(error);}

                    if(_.isObject(data) && _.isArray(data) && data.length == 1){

                        if(_.has(data[0], 'created_at')){

                            entity = this.setCreatedAt(entity, data[0].created_at);

                        }else{

                            return reject(new Error('Entity lacks a "created_at" property'));

                        }

                        entity = this.setUpdatedAt(entity);

                        dynamoutilities.saveRecord(this.table_name, entity, (error, data) => {

                            if(_.isError(error)){ reject(error);}

                            this.addToSearchIndex(entity, this.descriptive_name).then((indexed) => {

                                return resolve(entity);

                            }).catch((error) => {

                                return reject(error);

                            });

                        });

                    }else{

                        reject(new Error('Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist or multiples returned.'));

                    }

                }));

            }).catch((error) => {
                reject(error);
            });

        });

    }

		//NOT ACL enabled
    delete(id){

        return new Promise((resolve, reject) => {

            return this.can('update').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }else{

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


                    return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                        if(_.isError(error)){ reject(error);}

                        if(_.isObject(data) && _.isArray(data) && data.length == 1){

                            dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null, (error, data) => {

                                if(_.isError(error)){ reject(error);}

                                this.removeFromSearchIndex(id, this.descriptive_name).then((removed) => {

                                    du.debug('Removed: '+removed);

                                    return resolve({id: id});

                                }).catch((error) => {

                                    du.debug('Rejecting:', id);

                                    return reject(error);

                                });

                            });

                        }else{

                            return reject(new Error('Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.'));

                        }

                    }));

                }

            }).catch((error) => {
                reject(error);
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
                v = new Validator();
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

        permissionutilities.disableACLs();

        return;

    }

    enableACLs(argument){

        permissionutilities.enableACLs();

        return;

    }

    unsetGlobalUser(){

        permissionutilities.unsetGlobalUser();

        return;

    }

    setGlobalUser(user){

        if(_.has(user, 'id') || this.isEmail(user)){

            permissionutilities.setGlobalUser(user);

        }

        return;

    }

    acquireGlobalUser(){

        if(_.has(global, 'user')){

            return global.user;

        }

        return null;

    }

    removeFromSearchIndex(id, entity_type){

        let entity = {id:id, entity_type: entity_type};

        return indexingutilities.removeFromSearchIndex(entity);

    }

    addToSearchIndex(entity, entity_type){

        entity['entity_type'] = entity_type;

        du.warning('Indexing:', entity);

        return indexingutilities.addToSearchIndex(entity);

    }

    setCreatedAt(entity, created_at){

        if(typeof created_at === "undefined"){

            entity['created_at'] = timestamp.getISO8601();

        }else{

            entity['created_at'] = created_at;

        }

        entity['updated_at'] = entity['created_at'];

        return entity;

    }

    setUpdatedAt(entity){

        entity['updated_at'] = timestamp.getISO8601();

        return entity;

    }

}
