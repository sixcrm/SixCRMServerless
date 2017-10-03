'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const entityUtilitiesController = global.SixCRM.routes.include('controllers','entities/EntityUtilities');

//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...
//Technical Debt:  Methods that use "primary key" as argumentation should derive that value from patent class

module.exports = class entityController extends entityUtilitiesController {


  //NEW
    listByAssociations({id, field, pagination}){

      du.debug('List By Association');

      let scan_parameters = {
        filter_expression: 'contains(#f1, :id)',
        expression_attribute_names:{
            '#f1': field
        },
        expression_attribute_values: {
            ':id': id
        }
      };

      return this.scanByParameters({parameters: scan_parameters, pagination: pagination});

    }

 //NEW
    listByAssociation({id, field, pagination}){

      du.debug('List By Associations');

      let query_parameters = {
        filter_expression: '#f1 = :id',
        expression_attribute_values: {
          ':id':id
        },
        expression_attribute_names: {
          '#f1':field
        }
      };

      return this.list({query_parameters: query_parameters, pagination: pagination});

    }

    //Technical Debt:  The primary key definition should be set in the specific Entity class
    constructor(name){

        super();

        this.setPrimaryKey();

        this.setNames(name);

        //Technical Debt:  Need accountrole table?
        //Technical Debt:  Need notification settings to be bound to the accounts that they refer to?
        //Technical Debt:  Need accesskey to be specific to the account?
        //Technical Debt:  User signing strings should be bound to a specific account?

        this.nonaccounts = [
          'user', //can have multiple accounts
          'userdevicetoken', //userbound
          'accesskey', //userbound
          'notificationsetting', //userbound,
          'usersetting', //userbound
          'usersigningstring', //userbound
          'role', //global, available across accounts
          'account' //self-referntial, implicit
        ];

        this.dynamoutilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

    }

    listBySecondaryIndex({field, index_value, index_name, pagination}) {

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

                return this.dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    if(_.isError(error)){ return reject(error); }

                    return this.buildResponse(data, (error, response) => {

                        if(error){ return reject(error); }
                        return resolve(response);

                    });

                });

            });

        });

    }

    list({pagination, query_parameters}){

        du.debug('List');

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                du.debug('List - Can Read');

                if(permission != true){ return resolve(null); }

                if(_.isUndefined(query_parameters)){
                    query_parameters = {filter_expression: null, expression_attribute_values: null};
                }

                query_parameters = this.appendPagination(query_parameters, pagination);
                query_parameters = this.appendAccountFilter(query_parameters);

                du.debug('List - Before Scan Records');

                return Promise.resolve(this.dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

                    du.debug('List - After Scan Records');

                    if(_.isError(error)){ return reject(error); }

                    return this.buildResponse(data, (error, response) => {

                        du.debug('List End');

                        if(error){ return reject(error); }
                        return resolve(response);

                    });

                }));

            });

        });

    }

    //Technical Debt:  You can only paginate against the index...
    queryBySecondaryIndex({field, index_value, index_name, pagination, reverse_order}){

        du.debug('Query By Secondary Index');

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

                return Promise.resolve(this.dynamoutilities.queryRecordsFull(this.table_name, query_parameters, index_name, (error, data) => {

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

    //Technical Debt: this if garbage...
    getList({list_array}){

      du.debug('Get List');

      du.warning('List parameters','','','',list_array);

      if(!arrayutilities.nonEmpty(list_array)){
        eu.throwError('server', 'getList assumes a non-empty array of identifiers');
      }

      let in_parameters = this.dynamoutilities.createINQueryParameters(this.primary_key, list_array);

      return this.list({query_parameters: in_parameters})

    }

    getBySecondaryIndex({field, index_value, index_name, cursor, limit}){

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

                query_parameters = this.appendAccountFilter(query_parameters);

                return Promise.resolve(this.dynamoutilities.queryRecords(this.table_name, query_parameters, index_name, (error, data) => {

                    if(_.isError(error)){ reject(error);}

                    if(_.isArray(data)){

                        if(data.length == 1){

                            return resolve(data[0]);

                        }else{

                            if(data.length > 1){

                                return reject(eu.getError('bad_request','Multiple '+this.descriptive_name+'s returned where one should be returned.'));

                            }else{

                                return resolve(null);

                            }

                        }

                    }

                }));

            });

        });

    }

    /*
    search(){

    }
    */

    queryByParameters({parameters, pagination}){

      du.debug('Query By Parameters');

      return new Promise((resolve, reject) => {

          return this.can('read', true)
          .then(() =>  this.validate(parameters, global.SixCRM.routes.path('model','general/search_parameters.json')))
          .then(() => {

              let query_parameters = {
                  filter_expression: parameters.filter_expression,
                  expression_attribute_values: parameters.expression_attribute_values,
                  expression_attribute_names: parameters.expression_attribute_names
              };

              query_parameters = this.appendPagination(query_parameters, pagination);
              query_parameters = this.appendAccountFilter(query_parameters);

              if(_.has(parameters, 'reverse_order')) {
                  query_parameters['scan_index_forward'] = !parameters.reverse_order;
              }

              du.debug('Query Parameters: ', query_parameters);

              return Promise.resolve(this.dynamoutilities.queryRecordsFull(this.table_name, query_parameters, null, (error, data) => {

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

    scanByParameters({parameters, pagination}){

        du.debug('Scan By Parameters');

        return new Promise((resolve, reject) => {

          return this.can('read', true)
          .then(() =>  this.validate(parameters, global.SixCRM.routes.path('model','general/search_parameters.json')))
          .then(() => {

            let query_parameters = {
                filter_expression: parameters.filter_expression,
                expression_attribute_values: parameters.expression_attribute_values,
                expression_attribute_names: parameters.expression_attribute_names
            };

            query_parameters = this.appendPagination(query_parameters, pagination);
            query_parameters = this.appendAccountFilter(query_parameters);

            return Promise.resolve(this.dynamoutilities.scanRecordsFull(this.table_name, query_parameters, (error, data) => {

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

    get({id}){

      du.debug('Get');

      return this.can('read').then((permission) => {

        //Technical Debt:  Remove this.
        id = this.getID(id);

        if(permission !== true){ return null; }

        let query_parameters = {
          key_condition_expression: this.primary_key+' = :primary_keyv',
          expression_attribute_values: {':primary_keyv': id}
        };

        query_parameters = this.appendAccountFilter(query_parameters);

        return new Promise((resolve) => {

          du.warning(query_parameters);

          this.dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

            if(_.isError(error)){

              eu.throwError('server', error);

            }

            if(_.isObject(data) && _.isArray(data)){

              if(data.length > 1){

                eu.throwError('bad_request','Multiple '+this.descriptive_name+'s returned where one should be returned.');

              }

              if(_.isUndefined(data[0])){
                return resolve(null);
              }

              return resolve(data[0]);

            }

          });

        });

      });

    }

    countCreatedAfterBySecondaryIndex({date_time, field, index_name, cursor, limit}) {

      du.debug('Count Created After Secondary Index');

      return this.can('read').then((permission) => {

        if(permission !== true){

          return null;

        }

        let query_parameters = {
            key_condition_expression: '#'+field+' = :index_valuev',
            expression_attribute_values: {':index_valuev': global.user.id, ':createdv': date_time},
            expression_attribute_names: {},
            filter_expression: 'created_at > :createdv'
        };

        //Technical Debt:  This is silly.
        query_parameters.expression_attribute_names['#'+field] = field;

        if(!_.isUndefined(cursor)) {
          query_parameters.ExclusiveStartKey = cursor;
        }

        if(!_.isUndefined(limit)){
          query_parameters['limit'] = limit;
        }

        query_parameters = this.appendAccountFilter(query_parameters);

        return new Promise((resolve) => {

          this.dynamoutilities.countRecords(this.table_name, query_parameters, index_name, (error, data) => {

            if(_.isError(error)){

              eu.throwError('server', error);

            }

            resolve({count: data});

          });

        });

      });

    }

    //Technical Debt:  Could a user authenticate using his credentials and create an object under a different account (aka, account specification in the entity doesn't match the account
    create({entity}){

      du.debug('Create');

      return this.can('create', true).then(() => {

        entity = this.assignPrimaryKey(entity);
        entity = this.assignAccount(entity);
        entity = this.setCreatedAt(entity);

        du.info(entity);
        return this.validate(entity).then(() => {

          return this.exists({entity: entity}).then((exists) => {

            if(exists !== false){

              eu.throwError('bad_request','A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"');

            }

            return new Promise((resolve) => {

              this.dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                if(_.isError(error)){
                  eu.throwError('server', error);
                }

                return resolve(entity);

              });

            }).then(entity => {

              this.createRedshiftActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null);

              this.addToSearchIndex(entity, this.descriptive_name);

              return entity;

            });

          });

        });

      });

    }

		//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
    update({entity}){

      du.debug('Update');

      return this.can('update', true).then(() => {

        if(!_.has(entity, this.primary_key)){
          eu.throwError('bad_request','Unable to update '+this.descriptive_name+'. Missing property "'+this.primary_key+'"');
        }

        entity = this.assignAccount(entity);

        return this.exists({entity: entity}).then((exists) => {

          if(exists === false){
            eu.throwError('not_found','Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist or multiples returned.');
          }

          entity = this.persistCreatedUpdated(entity, exists);

          entity = this.setUpdatedAt(entity);

          return this.validate(entity).then(() => {

            return new Promise((resolve) => {

              this.dynamoutilities.saveRecord(this.table_name, entity, (error) => {

                if(_.isError(error)){
                  eu.throwError('server', error);
                }

                return resolve(entity);

              });

            }).then(entity => {

              this.createRedshiftActivityRecord(null, 'updated', {entity: entity, type: this.descriptive_name}, null);

              this.addToSearchIndex(entity, this.descriptive_name);

              return entity;

            });

          });

        });

      });

    }

    touch({entity}){

      du.debug('Touch');

      return this.can('update', true).then(() => {

        return this.exists({entity: entity}).then((exists) => {

          if (!exists) {

            return this.create({entity: entity});

          } else {

            return this.update({entity: entity});

          }

        });

      });

    }

    store({entity}){

        du.debug('Store');

        if(!_.has(entity, this.primary_key)){

            return this.create({entity: entity});

        }else{

          entity = this.assignAccount(entity);

          return this.exists({entity: entity}).then((exists) => {

            if(exists === false){

              return this.create({entity: entity});

            }else{

              return this.update({entity: entity});

            }

          });

        }

    }

		//NOT ACL enabled
    //Technical Debt:  Add Kinesis Activity
    delete({id}){

      du.debug('Delete');

      let spoofed_entity = {};

      spoofed_entity[this.primary_key] = id;

      return this.can('delete', true)
      .then(() => this.checkAssociatedEntities({id: id}))
      .then(() => this.exists({entity: spoofed_entity}))
      .then((exists) => {

        if(!exists){
          eu.throwError('not_found','Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.');
        }

        return new Promise((resolve) => {

          let delete_parameters = {};

          delete_parameters[this.primary_key] = id;

          this.dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null, (error) => {

            if(_.isError(error)){
              eu.throwError('server', error);
            }

            resolve(delete_parameters);

            this.removeFromSearchIndex(id, this.descriptive_name);

          });

        });

      });

    }

    exists({entity}){

      du.debug('Exists');

      if(!_.has(entity, this.primary_key)){

        return Promise.reject(eu.getError('bad_request','Unable to create '+this.descriptive_name+'. Missing property "'+this.primary_key+'"'));

      }else{

        let query_parameters = {
            key_condition_expression: this.primary_key+' = :primary_keyv',
            expression_attribute_values: {':primary_keyv': entity[this.primary_key]}
        };

        query_parameters = this.appendAccountFilter(query_parameters)

        return new Promise((resolve) => {

          this.dynamoutilities.queryRecords(this.table_name, query_parameters, null, (error, data) => {

            if(_.isError(error)){
              eu.throwError('server', error);
            }

            if(data.length > 1){

              eu.throwError('bad_request','Non-unique data present in the database for '+this.primary_key+': '+entity[this.primary_key]);

            }

            if(_.isObject(data) && _.isArray(data) && data.length == 1){

              return resolve(data[0]);

            }

            return resolve(false);

          });

        });

      }

    }

    checkAssociatedEntities({id}){

      du.debug('Check Associated Entities');

      if(_.isFunction(this.associatedEntitiesCheck)){

        return this.associatedEntitiesCheck({id: id}).then(associated_entities => {

          mvu.validateModel(associated_entities, global.SixCRM.routes.path('model','general/associated_entities_response.json'));

          if(arrayutilities.nonEmpty(associated_entities)){

            let entity_name = this.getDescriptiveName();

            eu.throwError(
              'forbidden',
              'The '+entity_name+' entity that you are attempting to delete is currently associated with other entities.  Please delete the entity associations before deleting this '+entity_name+'.',
              {associated_entites: JSON.stringify(associated_entities)}
            );

          }

          return true;

        });


      }else{

        return true;

      }

    }

    createAssociatedEntitiesObject({name, object}){

      du.debug('Create Associated Entities Object');

      //Technical Debt:  Not every entity has "ID"
      if(!_.has(object, 'id')){
        eu.throwError('server', 'Create Associated Entities expects the object parameter to have field "id"');
      }

      return {
        name: name,
        entity: {
          id: object.id
        }
      };

    }

}
