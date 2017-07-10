'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');
const validator = require('validator');

const timestamp = global.routes.include('lib', 'timestamp.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const indexingutilities = global.routes.include('lib', 'indexing-utilities.js');
const cacheController = global.routes.include('controllers', 'providers/Cache.js');


//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...

module.exports = class entityUtilitiesController{

    constructor(){

        this.permissionutilities = global.routes.include('lib', 'permission-utilities.js');

    }

    can(action, die){

        du.debug('Can');

        if(_.isUndefined(die)){ die = false; }

        let permission_function = () => this.permissionutilities.validatePermissions(action, this.descriptive_name);

        return permission_function().then((permission) => {

            if(die === true && permission !== true){

              eu.throwError('forbidden', 'Invalid Permissions: user can not '+action+' on '+this.descriptive_name);

            }else{

              return permission;

            }

        });

    }

    getFromCache(cache_object_key, data_function){

        du.debug('Get From Cache');

        return this.assureCacheController().then(() => {

            return this.cacheController.useCache(cache_object_key, data_function).then((permission) => {

                return permission;

            });

        });

    }

    assureCacheController(){

        du.debug('Assure Cache Controller');

        if(!_.has(this, 'cacheController')){
            this.cacheController = new cacheController();
        }

        return Promise.resolve(true);

    }

    createCanCacheKeyObject(action, entity){

        let user = this.getID(this.acquireGlobalUser());

        let account = this.acquireGlobalAccount();

        return {
            user: user,
            account: account,
            action: action,
            entity: entity
        };

    }

    validate(object, path_to_model){

        du.debug('Validate');

        if(_.isUndefined(path_to_model)){
            path_to_model = global.routes.path('model', 'entities/'+this.descriptive_name+'.json');
        }

        let valid = mvu.validateModel(object, path_to_model);

        if(_.isError(valid)){
            return Promise.reject(valid);
        }

        return Promise.resolve(valid);

    }

    isUUID(string, version){

        du.debug('Is UUID');

        if(_.isString(string)){

            return validator.isUUID(string, version);

        }

        return false;

    }

    isEmail(string){

        du.debug('Is Email');

        if(_.isString(string)){

            return validator.isEmail(string);

        }

        return false;

    }

    disableACLs(){

        du.debug('Disable ACLs');

        this.permissionutilities.disableACLs();

        return;

    }

    enableACLs(){

        du.debug('Enable ACLs');

        this.permissionutilities.enableACLs();

        return;

    }

    unsetGlobalUser(){

        du.debug('Unset Global User');

        this.permissionutilities.unsetGlobalUser();

        return;

    }

    setGlobalUser(user){

        du.debug('Set Global User');

        if(_.has(user, 'id') || this.isEmail(user)){

            this.permissionutilities.setGlobalUser(user);

        }

        return;

    }

    acquireGlobalUser(){

        du.debug('Acquire Global User');

        if(_.has(global, 'user')){

            return global.user;

        }

        return null;

    }

    acquireGlobalAccount(){

        du.debug('Acquire Global Account');

        if(_.has(global, 'account')){

            return global.account;

        }

        return null;

    }

    removeFromSearchIndex(id, entity_type){

        du.debug('Remove From Search Index');

        let entity = {id:id, entity_type: entity_type};

        return indexingutilities.removeFromSearchIndex(entity);

    }

    addToSearchIndex(entity, entity_type){

        du.debug('Add To Search Index');

        entity['entity_type'] = entity_type;

        du.info('Indexing:', entity);

        return indexingutilities.addToSearchIndex(entity);

    }

    setCreatedAt(entity, created_at){

        du.debug('Set Created At');

        if(_.isUndefined(created_at)){

            entity['created_at'] = timestamp.getISO8601();

        }else{

            entity['created_at'] = created_at;

        }

        entity = this.setUpdatedAt(entity);

        return entity;

    }

    setUpdatedAt(entity){

        du.debug('Set Updated At');

        if(!_.has(entity, 'created_at')){

            eu.throwError('validation','Entity lacks a "created_at" property');

        }

        if(!_.has(entity, 'updated_at')){

            entity['updated_at'] = entity.created_at;

        }else{

            entity['updated_at'] = timestamp.getISO8601();

        }

        return entity;

    }

    persistCreatedUpdated(entity, exists){

        du.debug('Persist Created Updated');

        if(!_.has(exists, 'created_at')){
            eu.throwError('validation','Entity lacks "created_at" property.');
        }

        if(!_.has(exists, 'updated_at')){
            eu.throwError('validation','Entity lacks "updated_at" property.');
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

        if(!_.isUndefined(pagination) && _.isObject(pagination)){

            du.debug('Pagination Object:', pagination);

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

                    eu.throwError('bad_request','Limit is a unrecognized format: '+limit);

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

                eu.throwError('bad_request','Unrecognized Exclusive Start Key format.');

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

                        eu.throwError('validation','Unrecognized format for Exclusive Start Key.')

                    }

                }

            }else{

                eu.throwError('validation','Unrecognized format for Cursor.')

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

                eu.throwError('bad_request','Unrecognized query parameter filter expression type.');

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

        //du.info(data);

        return pagination_object;

    }

    buildResponse(data, callback){

        du.debug('Build Response');

        if(_.isObject(data)){

            let pagination_object = this.buildPaginationObject(data);

            if (!_.has(data, "Items") || (!_.isArray(data.Items))) {
                return callback(eu.getError('not_found','Data has no items.'), null);
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

            return callback(eu.getError('not_found','Data is not an object.'), null);

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

    getID(object, primary_key){

        du.debug('Get ID');

        if(_.isUndefined(primary_key)){ primary_key = 'id'; }

        if(_.isString(object)){


        //Technical Debt:  Based on the controller calling this, we should understand which ID format is appropriate to return (UUID or email)
            return object;

            /*
            if(this.isUUID(object)){

                return object;

            }else if(this.isEmail(object)){

                return object;

            }else if(object == '*'){

                return object;

            }
            */

        }else if(_.isObject(object)){

            if(_.has(object, primary_key)){

                return object[primary_key];

            }

        }else if(_.isNull(object)){

            return null;

        }

        eu.throwError('bad_request','Could not determine identifier.');

    }

    setNames(name){

        du.deep('Set Names');

        this.descriptive_name = name;

        this.setEnvironmentTableName(name);

        this.setTableName(name);

    }

    setEnvironmentTableName(name){

        du.deep('Set Environment Table Name');

        let key = this.buildTableKey(name);
        let value = this.buildTableName(name);

        if(!_.has(process.env, key)){
            process.env[key] = value;
        }

    }

    setTableName(name){

        du.deep('Set Table Name');

        let key = this.buildTableKey(name);

        this.table_name = process.env[key];

    }

    buildTableKey(name){

        du.deep('Build Table Key');

        return name+'s_table';

    }

    buildTableName(name){

        du.deep('Build Table Name');

        return name+'s';

    }

    createRedshiftActivityRecord(actor, action, acted_upon, associated_with){

        let activityHelper = global.routes.include('helpers', 'redshift/Activity.js');

        return activityHelper.createActivity(actor, action, acted_upon, associated_with);

    }

}
