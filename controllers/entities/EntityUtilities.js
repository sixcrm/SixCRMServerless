
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const EncryptionHelper = global.SixCRM.routes.include('helpers', 'encryption/Encryption.js');

//Technical Debt:  Much of this controller should be abstracted to a "Query Builder" helper
//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...

module.exports = class entityUtilitiesController extends PermissionedController {

	constructor(){

		super();

		this.search_fields = [];

		this.encryptionhelper = new EncryptionHelper(this);
		this.sanitization = true;

	}

	sanitize(sanitize) {
		if (!_.isBoolean(sanitize)) {
			throw eu.getError('server', 'sanitize argument is not a boolean.');
		}

		this.sanitization = sanitize;
		return this;
	}

	//Technical Debt:  Refactor.
	catchPermissions(permissions, action){
		action = (_.isUndefined(action))?'read':action;

		if(permissions == false){

			du.error(action, permissions, global.user, global.account);

			this.throwPermissionsError();

		}

		return permissions;

	}

	handleErrors(error, fatal){
		fatal = (_.isUndefined(fatal))?false:fatal;

		if(_.has(error, 'code')){
			//Technical Debt: This appears bound to permissions...
			if(error.code == 403 && fatal == false){

				return null;

			}

			throw error;

		}

		throw eu.getError('server', error);

	}

	prune(entity, primary_key){
		primary_key = (_.isUndefined(primary_key))?this.primary_key:primary_key;

		if(objectutilities.isObject(entity)){

			objectutilities.map(entity, entity_property => {

				if(_.has(entity[entity_property], primary_key)){

					entity[entity_property] = entity[entity_property][primary_key];

				}else{

					return this.prune(entity[entity_property]);


				}

			});

		}

		return entity;

	}

	validate(object, path_to_model){
		if(_.isUndefined(path_to_model)){
			path_to_model = global.SixCRM.routes.path('model', 'entities/'+this.descriptive_name+'.json');
		}

		let valid = global.SixCRM.validate(object, path_to_model);

		if(_.isError(valid)){
			return Promise.reject(valid);
		}

		return Promise.resolve(valid);

	}

	getUUID(){
		return stringutilities.getUUID();

	}

	isUUID(string, version){
		return stringutilities.isUUID(string, version);

	}

	isEmail(string){
		return stringutilities.isEmail(string);

	}

	//Technical Debt:  This seems strange.
	acquireGlobalUser(){
		if(_.has(global, 'user')){

			return global.user;

		}

		return null;

	}

	//Technical Debt:  This seems strange.
	acquireGlobalAccount(){
		if(_.has(global, 'account')){

			return global.account;

		}

		return null;

	}

	setCreatedAt(entity, created_at){
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

			throw eu.getError('validation','Entity lacks a "created_at" property');

		}

		if(!_.has(entity, 'updated_at')){

			entity['updated_at'] = entity.created_at;

		}else{

			entity['updated_at'] = timestamp.getISO8601();

		}

		return entity;

	}

	persistCreatedUpdated(entity, exists){
		if(!_.has(exists, 'created_at')){
			throw eu.getError('validation','Entity lacks "created_at" property.');
		}

		if(!_.has(exists, 'updated_at')){
			throw eu.getError('validation','Entity lacks "updated_at" property.');
		}

		entity['created_at'] = exists.created_at;
		entity['updated_at'] = exists.updated_at;

		return entity;

	}

	marryQueryParameters(empirical_parameters, secondary_parameters){
		if(_.isUndefined(empirical_parameters) || !_.isObject(empirical_parameters)){
			return secondary_parameters;
		}

		arrayutilities.map(objectutilities.getKeys(secondary_parameters), key => {

			if(!_.has(empirical_parameters, key)){
				empirical_parameters[key] = secondary_parameters[key];
			}

		});

		return empirical_parameters;

	}

	assureSingular(results){
		if(_.isNull(results)){
			return null;
		}

		if(arrayutilities.isArray(results, true)){

			if(results.length == 1){
				return results[0];
			}

			if(results.length == 0){
				return null;
			}

			du.error('Non-singular result set', results);
			throw eu.getError('server', 'Non-specific '+this.descriptive_name+' entity results.');

		}

	}

	assignPrimaryKey(entity){
		if(!_.has(entity, this.primary_key)){

			if(this.primary_key == 'id'){

				entity[this.primary_key] = stringutilities.getUUID();

			}else{

				du.warning('Unable to assign primary key "'+this.primary_key+'" property');

			}

		}

		return entity;

	}

	assignAccount(entity){
		if(!_.has(entity, 'account')){
			//Technical Debt:  This is inappropriate here...
			if(_.has(global, 'account')){
				if(!_.includes(this.nonaccounts, this.descriptive_name)){

					entity.account = global.account;

				}
			}

		}else{
			//Technical Debt: Critical
			//Technical Debt:  Need to validate that the user that is creating the entity has permission to assign to the account.

		}

		return entity;

	}

	//Technical Debt:  Why was the account condition stuff here?
	appendUserCondition({query_parameters, user}){
		//Technical Debt:  This is inappropriate here...
		user = (_.isUndefined(user))?global.user:user;

		query_parameters = this.appendKeyConditionExpression(query_parameters, '#user = :userv');
		query_parameters = this.appendExpressionAttributeValues(query_parameters, ':userv', this.getID(user));
		query_parameters = this.appendExpressionAttributeNames(query_parameters, '#user', 'user');

		return query_parameters;

	}

	appendSearchConditions({query_parameters, search}){
		if(objectutilities.hasRecursive(search, 'name') && search.name && arrayutilities.isArray(this.search_fields) && arrayutilities.nonEmpty(this.search_fields)){
			let filterExpression = '';

			this.search_fields.forEach(field => {
				filterExpression += (filterExpression ? ' OR ' : '') + `contains(#search_${field}, :${field}_v)`;
				query_parameters = this.appendExpressionAttributeNames(query_parameters, `#search_${field}`, field);
				query_parameters = this.appendExpressionAttributeValues(query_parameters, `:${field}_v`, search.name);
			});

			query_parameters = this.appendFilterExpression(query_parameters, filterExpression);
		}

		if(objectutilities.hasRecursive(search, 'updated_at.after')){
			query_parameters = this.appendFilterExpression(query_parameters, '#updated_at_after_k > :updated_at_after_v');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#updated_at_after_k', 'updated_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':updated_at_after_v', search.updated_at.after);
		}

		if(objectutilities.hasRecursive(search, 'updated_at.before')){
			query_parameters = this.appendFilterExpression(query_parameters, '#updated_at_before_k < :updated_at_before_v');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#updated_at_before_k', 'updated_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':updated_at_before_v', search.updated_at.before);
		}

		if(objectutilities.hasRecursive(search, 'created_at.after')){
			query_parameters = this.appendFilterExpression(query_parameters, '#created_at_after_k > :created_at_after_v');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#created_at_after_k', 'created_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':created_at_after_v', search.created_at.after);
		}

		if(objectutilities.hasRecursive(search, 'created_at.before')){
			query_parameters = this.appendFilterExpression(query_parameters, '#created_at_before_k < :created_at_before_v');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#created_at_before_k', 'created_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':created_at_before_v', search.created_at.before);
		}

		return query_parameters;

	}

	appendAccountCondition({query_parameters, account, literal_master}){
		//Technical Debt:  This is inappropriate here...
		account = (_.isUndefined(account))?global.account:account;

		if(!this.accountFilterDisabled()){

			if(!_.includes(this.nonaccounts, this.descriptive_name)){

				if(!this.isMasterAccount() || literal_master){

					query_parameters = this.appendKeyConditionExpression(query_parameters, '#account = :accountv');
					query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', this.getID(account));
					query_parameters = this.appendExpressionAttributeNames(query_parameters, '#account', 'account');

				}

			}

		}

		return query_parameters;

	}

	appendAccountFilter({query_parameters, account}){
		//Technical Debt:  This is inappropriate here...
		account = (_.isUndefined(account))?global.account:account;

		if(this.accountFilterDisabled() !== true){

			if(!_.includes(this.nonaccounts, this.descriptive_name)){

				if(!this.isMasterAccount()){

					query_parameters = this.appendFilterExpression(query_parameters, 'account = :accountv');

					query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', account);

				}

			}

		}

		return query_parameters;

	}

	appendPagination({query_parameters, pagination}){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		if(!_.isUndefined(pagination) && _.isObject(pagination)){

			if(_.has(pagination, 'limit')){

				query_parameters = this.appendLimit({query_parameters: query_parameters, limit: pagination.limit});

			}

			if(_.has(pagination, 'exclusive_start_key')){

				query_parameters = this.appendExclusiveStartKey(query_parameters, pagination.exclusive_start_key);

			}else if(_.has(pagination, 'cursor')){

				query_parameters = this.appendCursor(query_parameters, pagination.cursor);

			}

		}

		return query_parameters;

	}

	appendLimit({query_parameters, limit}){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		limit = (_.isUndefined(limit))?100:limit;

		if(_.isString(limit) || _.isNumber(limit)){
			limit = parseInt(limit);
		}else{
			limit = 100;
		}

		if(limit < 1){
			throw eu.getError('forbidded', 'The graph API limit minimum is 1.');
		}

		if(limit > 100){
			throw eu.getError('forbidded', 'The graph API record limit is 100.');
		}

		query_parameters['limit'] = limit;

		return query_parameters;

	}

	appendExclusiveStartKey(query_parameters, exclusive_start_key){

		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		if(!_.isUndefined(exclusive_start_key)){

			if(_.isString(exclusive_start_key)){

				if(this.isUUID(exclusive_start_key) || this.isEmail(exclusive_start_key)){

					query_parameters['ExclusiveStartKey'] = this.appendCursor(exclusive_start_key);

				}else{

					let key_object = JSON.parse(exclusive_start_key);

					if (this.getAccountFilterIfPresent(query_parameters)) {
						key_object['account'] = this.getAccountFilterIfPresent(query_parameters);
					}

					query_parameters['ExclusiveStartKey'] =  key_object;

				}

			}else{

				throw eu.getError('bad_request','Unrecognized Exclusive Start Key format.');

			}

		}

		return query_parameters;

	}

	getAccountFilterIfPresent(query_parameters) {
		if (query_parameters.expression_attribute_values && query_parameters.expression_attribute_values[':accountv']) {
			return query_parameters.expression_attribute_values[':accountv'];
		}

		return null;
	}


	appendCursor(query_parameters, cursor){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

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

						throw eu.getError('validation','Unrecognized format for Exclusive Start Key.')

					}

				}

			}else{

				throw eu.getError('validation','Unrecognized format for Cursor.')

			}

		}

		return query_parameters;

	}

	assurePresence(thing, field, default_value){
		if(_.isUndefined(default_value)){

			default_value = {};

		}

		if(!_.has(thing, field) || _.isNull(thing[field]) || _.isUndefined(thing[field])){

			thing[field] = default_value;

		}

		return thing;

	}

	appendExpressionAttributeNames(query_parameters, key, value){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		query_parameters = this.assurePresence(query_parameters, 'expression_attribute_names');

		query_parameters.expression_attribute_names[key] = value;

		return query_parameters;

	}

	appendKeyConditionExpression(query_parameters, condition_expression, conjunction){
		conjunction = (_.isUndefined(conjunction))?'AND':conjunction;

		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		query_parameters = this.assurePresence(query_parameters, 'key_condition_expression');

		if(stringutilities.nonEmpty(query_parameters.key_condition_expression)){
			query_parameters.key_condition_expression += ' '+conjunction+' '+condition_expression;
		}else{
			query_parameters.key_condition_expression = condition_expression;
		}

		return query_parameters;

	}

	appendExpressionAttributeValues(query_parameters, key, value){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		query_parameters = this.assurePresence(query_parameters, 'expression_attribute_values');

		query_parameters.expression_attribute_values[key] = value;

		return query_parameters;

	}


	appendFilterExpression(query_parameters, filter_expression){
		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

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

				throw eu.getError('bad_request','Unrecognized query parameter filter expression type.');

			}

		}else{

			query_parameters.filter_expression = filter_expression;

		}

		return query_parameters;

	}

	buildPaginationObject(data){
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

			if(_.has(data.LastEvaluatedKey, this.primary_key)){
				pagination_object.end_cursor = data.LastEvaluatedKey[this.primary_key];
			}

		}

		//Technical Debt:  This doesn't appear to be working correctly
		if(!_.has(data, "LastEvaluatedKey")  || (_.has(data, "LastEvaluatedKey") && data.LastEvaluatedKey == null)){
			pagination_object.has_next_page = 'false';
		}

		//du.info(data);

		return pagination_object;

	}

	/*
    * This adds the pagination fields as well as the descriptive name of the entity before the array
    */

	buildResponse(data, secondary_function){
		objectutilities.isObject(data, true);

		if(!_.has(data, "Items")){
			du.warning('Missing Items property');
			return data;
		}

		arrayutilities.isArray(data.Items, true);

		if (this.sanitization) {
			arrayutilities.forEach(data.Items, item => this.censorEncryptedAttributes(item));
		} else {
			arrayutilities.forEach(data.Items, item => this.decryptAttributes(item));
		}

		if(!arrayutilities.nonEmpty(data.Items)){
			data.Items = null;
		}

		let resolve_object = {
			pagination: this.buildPaginationObject(data)
		};

		let name = stringutilities.pluralize(this.descriptive_name);

		resolve_object[name] = data.Items;

		if(_.isFunction(secondary_function)){
			resolve_object = secondary_function(resolve_object);
		}

		return resolve_object;

	}

	getItems(data){
		objectutilities.isObject(data, true);


		if(_.has(data, "Items") && _.isArray(data.Items)){
			if (this.sanitization) {
				arrayutilities.forEach(data.Items, item => this.censorEncryptedAttributes(item));
			} else {
				arrayutilities.forEach(data.Items, item => this.decryptAttributes(item));
			}

			return data.Items;
		}

		return null;

	}


	//Technical Debt:  This really doesn't need to return a promise
	getResult(result, field){
		if(_.isUndefined(field)){
			field = this.descriptive_name+'s';
		}

		if(_.has(result, field)){
			return Promise.resolve(result[field]);
		}else{
			return Promise.resolve(null);
		}

	}

	getID(object){
		if(_.isString(object)){

			//Technical Debt:  Based on the controller calling this, we should understand which ID format is appropriate to return (UUID or email)
			return object;

		}else if(_.isObject(object)){

			if(_.has(object, this.primary_key)){

				return object[this.primary_key];

			}

		}else if(_.isNull(object)){

			return null;

		} else if(_.isNumber(object)){

			return object;

		}

		throw eu.getError('bad_request',`Could not determine identifier for ${this.descriptive_name} for ID ${object}.`);

	}

	getDescriptiveName(){
		if(_.has(this, 'descriptive_name')){
			return this.descriptive_name;
		}

		return null;

	}

	setNames(name){
		this.descriptive_name = name;

		this.setEnvironmentTableName(name);

		this.setTableName(name);

	}

	setPrimaryKey(){
		if(!_.has(this, 'primary_key')){

			this.primary_key = 'id';

		}

	}

	setEnvironmentTableName(name){
		let key = this.buildTableKey(name);
		let value = this.buildTableName(name);

		if(!_.has(process.env, key)){
			process.env[key] = value;
		}

	}

	setTableName(name){
		let key = this.buildTableKey(name);

		this.table_name = process.env[key];

	}

	buildTableKey(name){
		name = stringutilities.pluralize(name);

		return name+'_table';

	}


	buildTableName(name){
		return stringutilities.pluralize(name);

	}

	asyncronousCreateBehaviors({entity: entity}){

		//Technical Debt:  This is inappropriate here...  These belong in helpers
		this.createAnalyticsActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null);

	}

	pushEvent({event_type = null, context = null, message_attributes = null} = {}) {
		if(event_type === null && _.has(this.event_type)){
			event_type = this.event_type;
		}

		if(context === null && _.has(this.parameters)){
			context = this.parameters.store;
		}

		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

	createAnalyticsActivityRecord(actor, action, acted_upon, associated_with){

		//Technical Debt:  This is inappropriate here...
		let ActivityHelper = global.SixCRM.routes.include('helpers', 'analytics/Activity.js');
		const activityHelper = new ActivityHelper();

		return activityHelper.createActivity(actor, action, acted_upon, associated_with);

	}

	transformListArray(list_array){
		if(arrayutilities.nonEmpty(list_array)){

			list_array = arrayutilities.filter(list_array, (list_item) => {
				return stringutilities.nonEmpty(list_item);
			});

			if(arrayutilities.nonEmpty(list_array)){
				return list_array;
			}

		}

		return null;

	}

	executeAssociatedEntityFunction(controller_name, function_name, function_arguments, retry = false){
		if(_.has(this, controller_name) && _.isFunction(this[controller_name][function_name])){

			this[controller_name].sanitization = this.sanitization;
			return this[controller_name][function_name](function_arguments);

		}else{

			if(retry){
				throw eu.getError('server', 'Unable to execute controller function: '+controller_name+'.'+function_name+'('+JSON.stringify(function_arguments)+')');
			}

			let controller_file_name = this.translateControllerNameToFilename(controller_name);

			this[controller_name] = global.SixCRM.routes.include('entities', controller_file_name);

			// Technical Debt: The following statement will not be necessary after singleton refactoring is finished.
			if (!_.isFunction(this[controller_name][function_name])) {
				this[controller_name] = new this[controller_name]();
			}

			return this.executeAssociatedEntityFunction(controller_name, function_name, function_arguments, true);

		}

	}

	translateControllerNameToFilename(controller_name){
		return stringutilities.uppercaseFirst(controller_name).replace('Controller', '')+'.js';

	}

	//Technical Debt:  Evaluate the utility of this method.
	createEndOfPaginationResponse(items_name, items) {
		let pagination = {};

		pagination.count = items.length;
		pagination.end_cursor = '';
		pagination.has_next_page = false;

		let response = {};

		response[items_name] = items;
		response['pagination'] = pagination;

		return Promise.resolve(response);

	}

	encryptAttributes(entity) {
		return this.encryptionhelper.encryptAttributes(this.encrypted_attribute_paths, entity);
	}

	decryptAttributes(entity) {
		return this.encryptionhelper.decryptAttributes(this.encrypted_attribute_paths, entity);
	}

	censorEncryptedAttributes(entity, custom_censor_fn) {
		return this.encryptionhelper.censorEncryptedAttributes(this.encrypted_attribute_paths, entity, custom_censor_fn);
	}

}
