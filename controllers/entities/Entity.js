'use strict';
const _ = require('underscore');

const dynamoutilities = global.routes.include('lib', 'dynamodb-utilities.js');
const du = global.routes.include('lib', 'debug-utilities.js');

const entityUtilitiesController = global.routes.include('controllers','entities/EntityUtilities');

//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...
//Technical Debt:  Methods that use "primary key" as argumentation should derive that value from patent class

module.exports = class entityController extends entityUtilitiesController {

    //Technical Debt:  The primary key definition should be set in the specific Entity class
    constructor(name){

        super();

        this.setNames(name);

        this.nonaccounts = ['user', 'userdevicetoken', 'role', 'accesskey', 'account', 'fulfillmentprovider','notificationsetting', 'usersetting', 'usersigningstring'];

    }

    listBySecondaryIndex(field, index_value, index_name, pagination) {

        du.debug('List By Secondary Index');

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

    list(pagination, query_parameters){

        du.debug('List');

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

    //Technical Debt:  You can only paginate against the index...
    queryBySecondaryIndex(field, index_value, index_name, pagination, reverse_order){

        du.debug('Query By Secondary Index');

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

    getList(list_array){

        if(!_.isArray(list_array)){
            return Promise.reject(new Error('List array must be of type array.'));
        }

        if(list_array.length < 1){
            return Promise.resolve([]);
        }

      //Technical Debt:  Replace this with a IN clause
        return Promise.all(list_array.map(list_item => this.get(list_item)));

    }

    getBySecondaryIndex(field, index_value, index_name, cursor, limit){

        du.debug('Get By Secondary Index');

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

    search(){

    }

    scanByParameters(parameters, pagination){

        du.debug('Scan By Parameters');

        return new Promise((resolve, reject) => {

            du.info(parameters);
            return this.can('read', true)
        .then(() =>  this.validate(parameters, global.routes.path('model','general/search_parameters.json')))
        .then(() => {

            let query_parameters = {
                filter_expression: parameters.filter_expression,
                expression_attribute_values: parameters.expression_attribute_values,
                expression_attribute_names: parameters.expression_attribute_names
            };

            query_parameters = this.appendPagination(query_parameters, pagination);
            query_parameters = this.appendAccountFilter(query_parameters);

          //du.warning(query_parameters);

            return Promise.resolve(dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                if(_.isError(error)){ return reject(error); }

                return this.buildResponse(data, (error, response) => {

                    if(error){ return reject(error); }

                    return resolve(response);

                });

            }));

        }).catch((error) => {

            return reject(error);

        });

        });

    }

    get(id, primary_key){

        du.debug('Get');

        return new Promise((resolve, reject) => {

            if(_.isUndefined(primary_key)){ primary_key = 'id'; }

            try{
                id = this.getID(id, primary_key);
            }catch(e){
                return reject(e);
            }

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
                du.warning(error);
                return reject(error);
            });

        });

    }

    countCreatedAfterBySecondaryIndex(date_time, field, index_name, cursor, limit) {

        du.debug('Count Created After Secondary Index');

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
    //Technical Debt:  Add Kinesis Activity
    create(entity, primary_key){

        du.debug('Create');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            return this.can('create', true).then(() => {

                entity = this.assignPrimaryKey(entity, primary_key);

                entity = this.assignAccount(entity);

                entity = this.setCreatedAt(entity);

                return this.validate(entity)
          .then(() => this.exists(entity, primary_key))
          .then((exists) => {

              if(exists !== false){ return reject(new Error('A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"')); }

              return dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                  if(_.isError(error)){ return reject(error);}

                  return this.createRedshiftActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null)
                  .then(() => this.addToSearchIndex(entity, this.descriptive_name))
                  .then(() => {

                      return resolve(entity);

                  }).catch((error) => {

                      return reject(error);

                  });

              });

          }).catch((error) => {

              return reject(error);

          });

            }).catch((error) => {

                return reject(error);

            });

        });

    }

		//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
    update(entity, primary_key){

        du.debug('Update');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            return this.can('update', true).then(() => {

                if(!_.has(entity, primary_key)){ return reject(new Error('Unable to update '+this.descriptive_name+'. Missing property "'+primary_key+'"')); }

                entity = this.assignAccount(entity);

                return this.validate(entity)
                .then(() => this.exists(entity, primary_key))
                .then((exists) => {

                    if(exists === false){ return reject(new Error('Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist or multiples returned.')); }

                  //Note:  People can't change these automatically included fields...
                    entity = this.persistCreatedUpdated(entity, exists);

                    entity = this.setUpdatedAt(entity);

                    return dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                        if(_.isError(error)){ return reject(error);}

                        return this.createRedshiftActivityRecord(null, 'updated', {entity: entity, type: this.descriptive_name}, null)
                        .then(() => this.addToSearchIndex(entity, this.descriptive_name))
                        .then(() => {

                            return resolve(entity);

                        }).catch((error) => {

                            return reject(error);

                        });

                    });

                }).catch((error) => {
                    return reject(error);
                });

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    touch(entity){

        du.debug('Touch');

        return new Promise((resolve, reject) => {

            return this.can('update', true).then(() => {

                //Technical Debt: Add Kinesis Activity
                return this.exists(entity).then((exists) => {

                    if (!exists) {
                        return resolve(this.create(entity));
                    } else {
                        return resolve(this.update(entity));
                    }
                });

            }).catch((error) => {
                return reject(error);
            });
        });

    }

    store(entity, primary_key){

        du.debug('Store');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(!_.has(entity, primary_key)){

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
    //Technical Debt:  Add Kinesis Activity
    delete(id, primary_key){

        du.debug('Delete');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        return new Promise((resolve, reject) => {

            if(_.isUndefined(primary_key)){ primary_key = 'id'; }

            try{
                id = this.getID(id, primary_key);
            }catch(e){
                return reject(e);
            }

            return this.can('delete', true).then(() => {

                let query_parameters = {
                    key_condition_expression: primary_key+' = :primary_keyv',
                    expression_attribute_values: {':primary_keyv': id}
                };

                let delete_parameters = {};

                delete_parameters[primary_key] = id;

          //Technical Debt:  Refactor.
          //Technical Debt:  What happens if this object that is being deleted is in non-accounts?
                if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){

                    if(global.account == '*'){

							//for now, do nothing

                    }else{

                        query_parameters.filter_expression = 'account = :accountv';
                        query_parameters.expression_attribute_values[':accountv'] = global.account;

                    }

                }

          //Exists?
                return Promise.resolve(dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

                    if(_.isError(error)){ reject(error);}

                    if(!_.isObject(data) || !_.isArray(data) || data.length !== 1){ return reject(new Error('Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.')); }

                    dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null, (error) => {

                        if(_.isError(error)){ reject(error);}

                        this.removeFromSearchIndex(id, this.descriptive_name).then((removed) => {

                            du.debug('Removed: '+removed);

                            return resolve(delete_parameters);

                        }).catch((error) => {

                            du.debug('Rejecting:', id);

                            return reject(error);

                        });

                    });

                }));

            }).catch((error) => {
                reject(error);
            });

        });

    }

    exists(entity, primary_key){

        du.debug('Exists');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(!_.has(entity, primary_key)){

            //Technical Debt:  What is this message?
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

}
