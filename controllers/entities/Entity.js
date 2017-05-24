'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

const timestamp = global.routes.include('lib', 'timestamp.js');
const dynamoutilities = global.routes.include('lib', 'dynamodb-utilities.js');
const permissionutilities = global.routes.include('lib', 'permission-utilities.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const indexingutilities = global.routes.include('lib', 'indexing-utilities.js');

//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.

module.exports = class entityController {

    constructor(table_name, descriptive_name){
        this.table_name = table_name;
        this.descriptive_name = descriptive_name;
        this.nonaccounts = ['user', 'userdevicetoken', 'role', 'accesskey', 'account', 'fulfillmentprovider','notificationsetting'];
    }

    can(action){

        du.debug('Can check:', action, this.descriptive_name);

        return new Promise((resolve, reject) => {

            permissionutilities.validatePermissions(action, this.descriptive_name).then((permission) => {

                du.debug('Has permission:', permission);

                return resolve(permission);

            })
            .catch((error) => {

                du.debug(error);

                return reject(error);

            });

        });

    }

    listBySecondaryIndex(field, index_value, index_name, pagination) {

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission != true){ return resolve(null); }

                let query_parameters = {
                    key_condition_expression: '#'+field+' = :index_valuev',
                    expression_attribute_values: {':index_valuev': index_value},
                    expression_attribute_names: {},
                    filter_expression: '#'+field+' = :index_valuev'
                }

                query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
                query_parameters = this.appendPagination(query_parameters, pagination);
                query_parameters = this.appendAccountFilter(query_parameters);

                return dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    if(_.isError(error)){ return reject(error); }

                    return this.buildResponse(data, (error, response) => {

                        if(error){ return reject(error); }
                        return resolve(response);

                    });

                });

            });

        });

    }

		//ACL enabled
    list(pagination, query_parameters){

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission != true){ return resolve(null); }

                if(_.isUndefined(query_parameters)){
                    query_parameters = {filter_expression: null, expression_attribute_values: null};
                }

                query_parameters = this.appendPagination(query_parameters, pagination);
                query_parameters = this.appendAccountFilter(query_parameters);

                return Promise.resolve(dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    if(_.isError(error)){ return reject(error); }

                    return this.buildResponse(data, (error, response) => {

                        if(error){ return reject(error); }
                        return resolve(response);

                    });

                }));

            });

        });

    }

		//ACL enabled
    //Technical Debt:  You can only paginate against the index...
    queryBySecondaryIndex(field, index_value, index_name, pagination, reverse_order){

        du.debug('Query by secondary index', field, index_value, index_name, pagination);

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission !== true){ return resolve(null); }

                let query_parameters = {
                    key_condition_expression: '#'+field+' = :index_valuev',
                    expression_attribute_values: {':index_valuev': index_value},
                    expression_attribute_names: {}
                }

                query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
                query_parameters = this.appendPagination(query_parameters, pagination);
                query_parameters = this.appendAccountFilter(query_parameters);

                if (reverse_order) {
                    query_parameters['scan_index_forward'] = false;
                }

                du.debug('Query Parameters: ', query_parameters);

                return Promise.resolve(dynamoutilities.queryRecordsFull(this.table_name, query_parameters, index_name, (error, data) => {

                    if(_.isError(error)){

                        return reject(error);

                    }

                    return this.buildResponse(data, (error, response) => {

                        if(error){ return reject(error); }
                        return resolve(response);

                    });

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
                    key_condition_expression: field+' = :index_valuev',
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

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }

                let query_parameters = {
                    key_condition_expression: primary_key+' = :primary_keyv',
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

            })
            .catch((error) => {
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

            })
            .catch((error) => {
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

            })
            .catch((error) => {
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
                    key_condition_expression: '#'+field+' = :index_valuev',
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
    create(entity, primary_key){

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            return this.can('create').then((permission) => {

                if(permission != true){ return resolve(null); }

                entity = this.assignPrimaryKey(entity, primary_key);

                entity = this.assignAccount(entity);

                if(!_.has(entity, primary_key)){ return reject(new Error('Unable to create '+this.descriptive_name+'. Missing property "'+primary_key+'"')); }

                return this.exists(entity, primary_key).then((exists) => {

                    if(exists !== false){ return reject(new Error('A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"')); }

                    entity = this.setCreatedAt(entity);

                    //Technical Debt:  Validate that this model adheres to a entity in /model/entities/{model_name}.json

                    return dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                        if(_.isError(error)){ return reject(error);}

                        this.addToSearchIndex(entity, this.descriptive_name).then(() => {

                            return resolve(entity);

                        })
                        .catch((error) => {

                            return reject(error);

                        });

                    });

                })
                .catch((error) => {

                    return reject(error);

                });

            })
            .catch((error) => {

                return reject(error);

            });

        });

    }

		//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
    update(entity, primary_key){

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            return this.can('update').then((permission) => {

                if(permission != true){ return resolve(null); }

                entity = this.assignAccount(entity);

                if(!_.has(entity, primary_key)){ return reject(new Error('Unable to update '+this.descriptive_name+'. Missing property "'+primary_key+'"')); }

                return this.exists(entity, primary_key).then((exists) => {

                    if(exists === false){ return reject(new Error('Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist or multiples returned.')); }

                    entity = this.marryCreatedUpdated(entity, exists);

                    entity = this.setUpdatedAt(entity);

                    //Technical Debt:  Validate that this model adheres to a entity in /model/entities/{model_name}.json

                    return dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                        if(_.isError(error)){ return reject(error);}

                        this.addToSearchIndex(entity, this.descriptive_name).then(() => {

                            return resolve(entity);

                        })
              .catch((error) => {

                  return reject(error);

              });

                    });

                })
          .catch((error) => {
              return reject(error);
          });

            })
        .catch((error) => {
            return reject(error);
        });

        });

    }

    store(entity, primary_key){

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(!_.has(entity, primary_key)){

        //User is relying on the entity class's ability to auto-assign identifiers...
            return this.create(entity, primary_key);

        }else{

            entity = this.assignAccount(entity);

            return this.exists(entity, primary_key).then((exists) => {

                if(exists === false){

                    return this.create(entity, primary_key);

                }else{

                    return this.update(entity, primary_key);

                }

            });

        }

    }

		//NOT ACL enabled
    delete(id, primary_key){

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {



            //Technical Debt:  Why is this "update"?
            return this.can('update').then((permission) => {

                if(permission != true){

                    return resolve(null);

                }else{

                    let query_parameters = {
                        key_condition_expression: primary_key+' = :primary_keyv',
                        expression_attribute_values: {':primary_keyv': id}
                    };

                    let delete_parameters = {};

                    delete_parameters[primary_key] = id;

                    //Technical Debt:  Refactor.
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

                            dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null, (error) => {

                                if(_.isError(error)){ reject(error);}

                                this.removeFromSearchIndex(id, this.descriptive_name).then((removed) => {

                                    du.debug('Removed: '+removed);

                                    return resolve(delete_parameters);

                                })
                                .catch((error) => {

                                    du.debug('Rejecting:', id);

                                    return reject(error);

                                });

                            });

                        }else{

                            return reject(new Error('Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.'));

                        }

                    }));

                }

            })
            .catch((error) => {
                reject(error);
            });

        });

    }

    exists(entity, primary_key){

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(!_.has(entity, primary_key)){

            return Promise.reject(new Error('Unable to create '+this.descriptive_name+'. Missing property "'+primary_key+'"'));

        }else{

            let query_parameters = {
                key_condition_expression: primary_key+' = :primary_keyv',
                expression_attribute_values: {':primary_keyv': entity[primary_key]}
            };

            query_parameters = this.appendAccountFilter(query_parameters)

            return new Promise((resolve, reject) => {

                dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                    if(_.isError(error)){ return reject(error);}

                    if(_.isObject(data) && _.isArray(data) && data.length == 1){

                        return resolve(data[0]);

                    }else if(data.length > 1){

                        return reject(new Error('Non-unique data present in the database for '+primary_key+': '+entity[primary_key]));

                    }

                    return resolve(false);

                });

            });

        }

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

                schema = global.routes.include('model', object_type);

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

    disableACLs(){

        permissionutilities.disableACLs();

        return;

    }

    enableACLs(){

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

        du.warning('Created At:', created_at);

        if(_.isUndefined(created_at)){

            entity['created_at'] = timestamp.getISO8601();

        }else{

            entity['created_at'] = created_at;

        }

        entity = this.setUpdatedAt(entity);

        return entity;

    }

    setUpdatedAt(entity){

        if(!_.has(entity, 'created_at')){

            throw new Error('Entity lacks a "created_at" property');

        }

        if(!_.has(entity, 'updated_at')){

            entity['updated_at'] = entity.created_at;

        }else{

            entity['updated_at'] = timestamp.getISO8601();

        }

        return entity;

    }

    marryCreatedUpdated(entity, exists){

        if(!_.has(exists, 'created_at')){
            throw new Error('Entity lacks "created_at" property.');
        }

        if(!_.has(exists, 'updated_at')){
            throw new Error('Entity lacks "updated_at" property.');
        }

        entity['created_at'] = exists.created_at;
        entity['updated_at'] = exists.updated_at;

        return entity;

    }

    assignPrimaryKey(entity, primary_key){

        du.debug('Assign Primary Key');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(!_.has(entity, primary_key)){

            if(primary_key == 'id'){

                entity.id = uuidV4();

            }else{

                du.warning('Unable to assign primary key "'+primary_key+'" property');

            }

        }

        return entity;

    }

    assignAccount(entity){

        du.debug('Assign Account');

        if(!_.has(entity, 'account')){

            du.debug('No account specified in the entity record');

            if(_.has(global, 'account')){

                du.debug('Global account identified.  Appending to the entity.');

                if(!_.contains(this.nonaccounts, this.descriptive_name)){

                    entity.account = global.account;

                }else{

                    du.debug('Entity exists in the non-account list.');

                }

            }else{

                du.debug('No global account value available.');

            }

        }else{

            du.debug('Entity already bound to a account.');

        }

        return entity;

    }

    appendAccountFilter(query_parameters){

        du.debug('Append Account Filter');

        if(global.disableaccountfilter !== true){

            if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){

                if(global.account == '*'){

                    du.warning('Master account in use.');

                }else{

                    query_parameters = this.appendFilterExpression(query_parameters, 'account = :accountv');

                    query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', global.account);

                }

            }

        }else{

            du.warning('Global Account Filter Disabled');

        }

        return query_parameters;

    }

    appendPagination(query_parameters, pagination){

        du.debug('Append Pagination');

        du.debug('Pagination Object:', pagination);

        if(!_.isUndefined(pagination) && _.isObject(pagination)){

            if(_.has(pagination, 'limit')){

                query_parameters = this.appendLimit(query_parameters, pagination.limit);

            }

            if(_.has(pagination, 'exclusive_start_key')){

                query_parameters = this.appendExclusiveStartKey(query_parameters, pagination.exclusive_start_key);

            }else if(_.has(pagination, 'cursor')){

                query_parameters = this.appendCursor(query_parameters, pagination.cursor);

            }

        }

        return query_parameters;

    }

    appendLimit(query_parameters, limit){

        du.debug('Append Limit');

        if(!_.isUndefined(limit)){

            if(_.isString(limit) || _.isNumber(limit)){

                limit = parseInt(limit);

                if(_.isNumber(limit) && limit > 0){

                    query_parameters['limit'] = limit;

                }else{

                    throw new Error('Limit is a unrecognized format: '+limit);

                }

            }

        }

        return query_parameters;

    }

    appendExclusiveStartKey(query_parameters, exclusive_start_key){

        du.debug('Append Exclusive Start Key');

        if(!_.isUndefined(exclusive_start_key)){

            if(_.isString(exclusive_start_key)){

                if(this.isUUID(exclusive_start_key) || this.isEmail(exclusive_start_key)){

                    query_parameters['ExclusiveStartKey'] = this.appendCursor(exclusive_start_key);

                }else{

                    query_parameters['ExclusiveStartKey'] =  JSON.parse(exclusive_start_key);

                }

            }else{

                throw new Error('Unrecognized Exclusive Start Key format.');

            }

        }

        return query_parameters;

    }


    appendCursor(query_parameters, cursor){

        du.debug('Append Cursor');

        du.debug(cursor);

        if(!_.isUndefined(cursor) && !_.isNull(cursor)){

            if(_.isString(cursor)){

                if(this.isEmail(cursor) || this.isUUID(cursor) || cursor == '*'){

                    query_parameters = this.appendExclusiveStartKey(query_parameters, JSON.stringify({id: cursor}));

                  //query_parameters['ExclusiveStartKey'] = { id: cursor };

                }else{

                    let parsed_cursor;

                    try{

                        parsed_cursor = JSON.parse(cursor);

                    }catch(e){

                        du.warning('Unable to parse cursor:', cursor, e);

                    }

                    if(parsed_cursor){

                        query_parameters = this.appendExclusiveStartKey(query_parameters, JSON.stringify(parsed_cursor));

                    }else{

                        throw new Error('Unrecognized format for Exclusive Start Key.')

                    }

                }

            }else{

                throw new Error('Unrecognized format for Cursor.')

            }

        }

        return query_parameters;

    }

    assurePresence(thing, field, default_value){

        du.debug('Assure Presence');

        if(_.isUndefined(default_value)){

            default_value = {};

        }

        if(!_.has(thing, field) || _.isNull(thing[field])){

            thing[field] = default_value;

        }

        return thing;

    }

    appendExpressionAttributeNames(query_parameters, key, value){

        du.debug('Append Expression Attribute Names');

        query_parameters = this.assurePresence(query_parameters, 'expression_attribute_names');

        query_parameters.expression_attribute_names[key] = value;

        return query_parameters;

    }

    appendKeyConditionExpression(query_parameters, key, value){

        du.debug('Append Key Condition Expression');

        query_parameters = this.assurePresence(query_parameters, 'key_condition_expression');

        query_parameters.key_condition_expression[key] = value;

        return query_parameters;

    }

    appendExpressionAttributeValues(query_parameters, key, value){

        du.debug('Append Expression Attribute Values');

        query_parameters = this.assurePresence(query_parameters, 'expression_attribute_values');

        query_parameters.expression_attribute_values[key] = value;

        return query_parameters;

    }


    appendFilterExpression(query_parameters, filter_expression){

        du.debug('Append Filter Expression');

        if (_.has(query_parameters, 'filter_expression')){

            if(_.isNull(query_parameters.filter_expression) || _.isUndefined(query_parameters.filter_expression)){

                query_parameters.filter_expression = filter_expression;

            }else if(_.isString(query_parameters.filter_expression)){

                if(query_parameters.filter_expression.trim() == ''){

                    query_parameters.filter_expression = filter_expression;

                }else{

                    query_parameters.filter_expression += ' AND '+filter_expression;

                }

            }else{

                throw new Error('Unrecognized query parameter filter expression type.');

            }

        }else{

            query_parameters.filter_expression = filter_expression;

        }

        return query_parameters;

    }

    buildPaginationObject(data){

        du.debug('Build Pagnination Object');

        var pagination_object = {
            count: '',
            end_cursor: '',
            has_next_page: 'true',
            last_evaluated: ''
        }

      // Technical Debt: We should improve the way we validate the data, either by using dedicated
      // response objects, JSON schema validation or both.
        if(_.has(data, "Count")){
            pagination_object.count = data.Count;
        }

        if(_.has(data, "LastEvaluatedKey")){

            pagination_object.last_evaluated = JSON.stringify(data.LastEvaluatedKey);

            if(_.has(data.LastEvaluatedKey, "id")){
                pagination_object.end_cursor = data.LastEvaluatedKey.id;
            }

        }

      //Technical Debt:  This doesn't appear to be working correctly
        if(!_.has(data, "LastEvaluatedKey")  || (_.has(data, "LastEvaluatedKey") && data.LastEvaluatedKey == null)){
            pagination_object.has_next_page = 'false';
        }

        du.info(data);

        return pagination_object;

    }

    buildResponse(data, callback){

        du.debug('Append Exclusive Start Key');

        if(_.isObject(data)){

            let pagination_object = this.buildPaginationObject(data);

            if (!_.has(data, "Items") || (!_.isArray(data.Items))) {
                return callback(new Error('Data has no items.'), null);
            }

            if(data.Items.length < 1){
                data.Items = null;
            }

            var resolve_object = {
                pagination: pagination_object
            };

            resolve_object[this.descriptive_name+'s'] = data.Items;

            return callback(null, resolve_object);

        } else {

            return callback(new Error('Data is not an object.'), null);

        }

    }

    getResult(result, field){

        du.debug('Get Result');

        if(_.isUndefined(field)){
            field = this.descriptive_name+'s';
        }

        if(_.has(result, field)){

            return Promise.resolve(result[field]);

        }else{

            return Promise.resolve(null);

        }

    }

}
