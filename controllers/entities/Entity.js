'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js')
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const entityUtilitiesController = global.SixCRM.routes.include('controllers','entities/EntityUtilities');

//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...
//Technical Debt:  Methods that use "primary key" as argumentation should derive that value from patent class
//Technical Debt:  Need accountrole table?
//Technical Debt:  Need notification settings to be bound to the accounts that they refer to?
//Technical Debt:  Need accesskey to be specific to the account?
//Technical Debt:  User signing strings should be bound to a specific account?

module.exports = class entityController extends entityUtilitiesController {

  /*
  * "get" implies a singular object result.
  * "list" implies multiple results are returned as an object which also has a pagination object
  */

    constructor(name){

        super();

        this.setPrimaryKey();

        this.setNames(name);

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

    listByAssociations({id, field, pagination, fatal}){

      du.debug('List By Association');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        return {
          filter_expression: 'contains(#f1, :id)',
          expression_attribute_names:{
              '#f1': field
          },
          expression_attribute_values: {
              ':id': id
          }
        };

      })
      .then((query_parameters) => this.scanByParameters({parameters: query_parameters, pagination: pagination}))
      .catch(this.handleErrors);

    }

    listByAssociation({id, field, pagination, fatal}){

      du.debug('List By Associations');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        //Technical Debt:  Add validation

        return {
          filter_expression: '#f1 = :id',
          expression_attribute_values: {
            ':id':id
          },
          expression_attribute_names: {
            '#f1':field
          }
        };

      })
      .then((query_parameters) => this.list({query_parameters: query_parameters, pagination: pagination}))
      .catch(this.handleErrors);

    }

    listBySecondaryIndex({field, index_value, index_name, pagination, fatal}) {

      du.debug('List By Secondary Index');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        let query_parameters = {
            key_condition_expression: '#'+field+' = :index_valuev',
            expression_attribute_values: {':index_valuev': index_value},
            expression_attribute_names: {},
            filter_expression: '#'+field+' = :index_valuev'
        }

        query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
        query_parameters = this.appendPagination(query_parameters, pagination);
        query_parameters = this.appendAccountFilter(query_parameters);

        return query_parameters;

      })
      .then((query_parameters) => this.dynamoutilities.scanRecords(this.table_name, query_parameters))
      .then((data) => this.buildResponse(data))
      .catch(this.handleErrors);

    }

    listBy({list_array, field, fatal}){

      du.debug('List By');

      field = (_.isUndefined(field))?this.primary_key:field;

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => this.transformListArray(list_array))
      .then((list_array) => {

        if(arrayutilities.nonEmpty(list_array)){
          return this.list({query_parameters: this.dynamoutilities.createINQueryParameters(field, list_array)});
        }

        return null;

      })
      .catch(this.handleErrors);

    }

    //Technical Debt:  This does not necessarily return results of size "limit".  Next page can be true...
    list({query_parameters, pagination, fatal}){

      du.debug('List');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        let default_query_parameters = {
          filter_expression: null,
          expression_attribute_values: null
        };

        query_parameters = this.marryQueryParameters(query_parameters, default_query_parameters);
        query_parameters = this.appendPagination(query_parameters, pagination);
        query_parameters = this.appendAccountFilter(query_parameters);

        return query_parameters;

      })
      .then((query_parameters) => this.dynamoutilities.scanRecords(this.table_name, query_parameters))
      .then((data) => this.buildResponse(data))
      .catch((error) => this.handleErrors(error, fatal));

    }

    //Technical Debt:  You can only paginate against the index...
    queryBySecondaryIndex({field, index_value, index_name, pagination, reverse_order, fatal}){

      du.debug('Query By Secondary Index');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

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

        return query_parameters;

      })
      .then((query_parameters) => this.dynamoutilities.queryRecords(this.table_name, query_parameters, index_name))
      .then((data) => this.buildResponse(data))
      .catch(this.handleErrors);

    }

    getBySecondaryIndex({field, index_value, index_name, fatal}){

      du.debug('Get By Secondary Index');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        let query_parameters = {
            key_condition_expression: field+' = :index_valuev',
            expression_attribute_values: {':index_valuev': index_value},
        }

        return this.appendAccountFilter(query_parameters);

      })
      .then((query_parameters) => this.dynamoutilities.queryRecords(this.table_name, query_parameters, index_name))
      .then(data => this.getItems(data))
      .then(items => this.assureSingular(items))
      .catch(this.handleErrors);

    }

    queryByParameters({parameters, pagination, index, fatal}){

      du.debug('Query By Parameters');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => this.validate(parameters, global.SixCRM.routes.path('model','general/search_parameters.json')))
      .then(() => {

        index = (!_.isUndefined(index))?index:null;

        let query_parameters_template = {
          required:{
            filter_expression: 'filter_expression',
            expression_attribute_values:'expression_attribute_values',
            expression_attribute_names:'expression_attribute_names'
          },
          optional: {
            key_condition_expression: 'key_condition_expression',
            select:'select'
          }
        };

        let query_parameters = objectutilities.transcribe(query_parameters_template.required, parameters, {}, true);

        query_parameters = objectutilities.transcribe(query_parameters_template.optional, parameters, query_parameters, false);
        query_parameters = this.appendPagination(query_parameters, pagination);
        query_parameters = this.appendAccountFilter(query_parameters);

        if(_.has(parameters, 'reverse_order')) {
            query_parameters['scan_index_forward'] = !parameters.reverse_order;
        }

        return this.dynamoutilities.queryRecords(this.table_name, query_parameters, index);

      })
      .then((data) => this.buildResponse(data))
      .catch(this.handleErrors);

    }

    scanByParameters({parameters, pagination, fatal}){

      du.debug('Scan By Parameters');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => this.validate(parameters, global.SixCRM.routes.path('model','general/search_parameters.json')))
      .then(() => {

        let query_parameters = {
            filter_expression: parameters.filter_expression,
            expression_attribute_values: parameters.expression_attribute_values,
            expression_attribute_names: parameters.expression_attribute_names
        };

        query_parameters = this.appendPagination(query_parameters, pagination);
        query_parameters = this.appendAccountFilter(query_parameters);

        return this.dynamoutilities.scanRecords(this.table_name, query_parameters);

      })
      .then((data) => this.buildResponse(data))
      .catch(this.handleErrors);

    }

    //NOTE: Returns an entity
    get({id, fatal}){

      du.debug('Get');

      return this.can('read', fatal)
      .then((permission) => this.catchPermissions(permission, 'read'))
      .then(() => {

        let query_parameters = {
          key_condition_expression: this.primary_key+' = :primary_keyv',
          expression_attribute_values: {':primary_keyv': this.getID(id)}
        };

        query_parameters = this.appendAccountFilter(query_parameters);

        return this.dynamoutilities.queryRecords(this.table_name, query_parameters, null);

      })
      .then((data) => this.getItems(data))
      .then(items => this.assureSingular(items))
      .catch((error) => this.handleErrors(error, fatal));

    }

    //Technical Debt:  Could a user authenticate using his credentials and create an object under a different account (aka, account specification in the entity doesn't match the account
    create({entity}){

      du.debug('Create');

      return this.can('create', true)
      .then(() => {

        entity = this.assignPrimaryKey(entity);
        entity = this.assignAccount(entity);
        entity = this.setCreatedAt(entity);

      })
      .then(() => this.validate(entity))
      .then(() => this.exists({entity: entity}))
      .then((exists) => {

        if(exists !== false){
          eu.throwError('bad_request','A '+this.descriptive_name+' already exists with ID: "'+entity.id+'"');
        }

      })
      .then(() => this.dynamoutilities.saveRecord(this.table_name, entity))
      .then(() => {

        this.createRedshiftActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null);
        this.addToSearchIndex(entity, this.descriptive_name);

        return entity;

      });

    }

		//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
    update({entity}){

      du.debug('Update');

      return this.can('update', true)
      .then(() => {

        if(!_.has(entity, this.primary_key)){
          eu.throwError('bad_request','Unable to update '+this.descriptive_name+'. Missing property "'+this.primary_key+'"');
        }

      })
      .then(() => {
        entity = this.assignAccount(entity);
      })
      .then(() => this.exists({entity: entity, return_entity: true}))
      .then((existing_entity) => {

        if(existing_entity === null){
          eu.throwError('not_found','Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist.');
        }

        return existing_entity;

      })
      .then((existing_entity) => {
        entity = this.persistCreatedUpdated(entity, existing_entity);
        entity = this.setUpdatedAt(entity);
      })
      .then(() => this.validate(entity))
      .then(() => this.dynamoutilities.saveRecord(this.table_name, entity))
      .then(() => {

        this.createRedshiftActivityRecord(null, 'updated', {entity: entity, type: this.descriptive_name}, null);

        this.addToSearchIndex(entity, this.descriptive_name);

        return entity;

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

    //Technical Debt:  Nomenclature should be "assure"
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

      let delete_parameters = {};

      delete_parameters[this.primary_key] = id;

      return this.can('delete', true)
      .then(() => this.checkAssociatedEntities({id: id}))
      .then(() => this.exists({entity: delete_parameters}))
      .then((exists) => {
        if(!exists){
          eu.throwError('not_found','Unable to delete '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist or multiples returned.');
        }
      })
      .then(() => this.dynamoutilities.deleteRecord(this.table_name, delete_parameters, null, null))
      .then((result) => {

        this.removeFromSearchIndex(id, this.descriptive_name);

        return delete_parameters;

      });

    }

    //Note: UTILITY Method - has no permissioning... DANGER
    exists({entity, return_entity}){

      du.debug('Exists');

      if(!_.has(entity, this.primary_key)){
        eu.throwError('server', 'Unable to create '+this.descriptive_name+'. Missing property "'+this.primary_key+'"');
      }

      return_entity = _.isUndefined(return_entity)?false:return_entity;

      let query_parameters = {
          key_condition_expression: this.primary_key+' = :primary_keyv',
          expression_attribute_values: {':primary_keyv': entity[this.primary_key]}
      };

      query_parameters = this.appendAccountFilter(query_parameters);

      return this.dynamoutilities.queryRecords(this.table_name, query_parameters, null)
      .then(data => this.getItems(data))
      .then(items => this.assureSingular(items))
      .then(item => {

        if(return_entity == true){

          return item;

        }else{

          if(_.isNull(item)){
            return false;
          }

          return true;

        }

      });

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
