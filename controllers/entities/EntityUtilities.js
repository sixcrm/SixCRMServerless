
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

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

		const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
		this.preIndexingHelperController = new PreIndexingHelperController();

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

		du.debug('Catch Permissions');

		du.debug('Permissions', permissions, 'Action', action);

		action = (_.isUndefined(action))?'read':action;

		if(permissions == false){

			this.throwPermissionsError();

		}

		return permissions;

	}

	handleErrors(error, fatal){

		du.debug('Handle Errors');

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

		du.debug('Prune');

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

		du.debug('Validate');

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

		du.debug('Get UUID');

		return stringutilities.getUUID();

	}

	isUUID(string, version){

		du.debug('Is UUID');

		return stringutilities.isUUID(string, version);

	}

	isEmail(string){

		du.debug('Is Email');

		return stringutilities.isEmail(string);

	}

	//Technical Debt:  This seems strange.
	acquireGlobalUser(){

		du.debug('Acquire Global User');

		if(_.has(global, 'user')){

			return global.user;

		}

		return null;

	}

	//Technical Debt:  This seems strange.
	acquireGlobalAccount(){

		du.debug('Acquire Global Account');

		if(_.has(global, 'account')){

			return global.account;

		}

		return null;

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

		du.debug('Persist Created Updated');

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

		du.debug('Marry Query Parameters');

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

		du.debug('Assure Singular');

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

			throw eu.getError('server', 'Non-specific '+this.descriptive_name+' entity results.');

		}

	}

	assignPrimaryKey(entity){

		du.debug('Assign Primary Key');

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

		du.debug('Assign Account');

		if(!_.has(entity, 'account')){

			du.debug('No account specified in the entity record');

			//Technical Debt:  This is inappropriate here...
			if(_.has(global, 'account')){

				du.debug('Global account identified.  Appending to the entity.');

				if(!_.includes(this.nonaccounts, this.descriptive_name)){

					entity.account = global.account;

				}else{

					du.debug('Entity exists in the non-account list.');

				}

			}else{

				du.debug('No global account value available.');

			}

		}else{

			du.debug('Entity already bound to a account.');
			//Technical Debt: Critical
			//Technical Debt:  Need to validate that the user that is creating the entity has permission to assign to the account.

		}

		return entity;

	}

	//Technical Debt:  Why was the account condition stuff here?
	appendUserCondition({query_parameters, user}){

		du.debug('Append User Condition');

		//Technical Debt:  This is inappropriate here...
		user = (_.isUndefined(user))?global.user:user;

		query_parameters = this.appendKeyConditionExpression(query_parameters, '#user = :userv');
		query_parameters = this.appendExpressionAttributeValues(query_parameters, ':userv', this.getID(user));
		query_parameters = this.appendExpressionAttributeNames(query_parameters, '#user', 'user');

		return query_parameters;

	}

	appendSearchConditions({query_parameters, search}){

		du.debug('Append Updated At Condition');

		/*
      //validate...
      if(objectutilities.hasRecursive(search, 'name')){


      }

      if(objectutilities.hasRecursive(search, 'active')){


      }
      */

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

		du.debug('Append Account Condition');

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

		du.debug('Append Account Filter');

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

		du.debug('Append Pagination');

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

		du.debug('Append Limit');

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

		du.debug('Append Exclusive Start Key', query_parameters, exclusive_start_key);

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

		du.debug('Append Cursor');

		du.debug(cursor);

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

		du.debug('Assure Presence');

		if(_.isUndefined(default_value)){

			default_value = {};

		}

		if(!_.has(thing, field) || _.isNull(thing[field]) || _.isUndefined(thing[field])){

			thing[field] = default_value;

		}

		return thing;

	}

	appendExpressionAttributeNames(query_parameters, key, value){

		du.debug('Append Expression Attribute Names');

		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		query_parameters = this.assurePresence(query_parameters, 'expression_attribute_names');

		query_parameters.expression_attribute_names[key] = value;

		return query_parameters;

	}

	appendKeyConditionExpression(query_parameters, condition_expression, conjunction){

		du.debug('Append Key Condition Expression');

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

		du.debug('Append Expression Attribute Values');

		query_parameters = (_.isUndefined(query_parameters))?{}:query_parameters;

		query_parameters = this.assurePresence(query_parameters, 'expression_attribute_values');

		query_parameters.expression_attribute_values[key] = value;

		return query_parameters;

	}


	appendFilterExpression(query_parameters, filter_expression){

		du.debug('Append Filter Expression');

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

		du.debug('Build Response');

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


		du.debug('Get Items');

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

	getID(object){

		du.debug('Get ID');

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

			if(_.has(object, this.primary_key)){

				return object[this.primary_key];

			}

		}else if(_.isNull(object)){

			return null;

		} else if(_.isNumber(object)){

			return object;

		}

		throw eu.getError('bad_request','Could not determine identifier.');

	}

	getDescriptiveName(){

		du.debug('Get Descriptive Name');

		if(_.has(this, 'descriptive_name')){
			return this.descriptive_name;
		}

		return null;

	}

	setNames(name){

		du.debug('Set Names');

		this.descriptive_name = name;

		this.setEnvironmentTableName(name);

		this.setTableName(name);

	}

	setPrimaryKey(){

		du.debug('Set Primary Key');

		if(!_.has(this, 'primary_key')){

			this.primary_key = 'id';

		}

	}

	setEnvironmentTableName(name){

		du.debug('Set Environment Table Name');

		let key = this.buildTableKey(name);
		let value = this.buildTableName(name);

		if(!_.has(process.env, key)){
			process.env[key] = value;
		}

	}

	setTableName(name){

		du.debug('Set Table Name');

		let key = this.buildTableKey(name);

		this.table_name = process.env[key];

	}

	buildTableKey(name){

		du.debug('Build Table Key');

		name = stringutilities.pluralize(name);

		return name+'_table';

	}


	buildTableName(name){

		du.debug('Build Table Name');

		return stringutilities.pluralize(name);

	}

	asyncronousCreateBehaviors({entity: entity}){

		//Technical Debt:  This is inappropriate here...  These belong in helpers
		this.createAnalyticsActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null);

	}

	pushEvent({event_type, context, message_attributes}){

		du.debug('Push Event');

		if(_.isUndefined(event_type) || _.isNull(event_type)){
			if(_.has(this, 'event_type')){
				event_type = this.event_type;
			}else if (!_.isUndefined(context) && !_.isNull(context) && _.has(context, 'event_type') && _.isString(context.event_type)){
				event_type = context.event_type;
			}else{
				throw eu.getError('server', 'Unable to identify event_type.');
			}
		}

		if(_.isUndefined(context) || _.isNull(context)){
			if(objectutilities.hasRecursive(this, 'parameters.store')){
				context = this.parameters.store;
			}else{
				throw eu.getError('server', 'Unset context.');
			}
		}

		if(_.isUndefined(message_attributes) || _.isNull(message_attributes)){
			message_attributes = {
				'event_type': {
					DataType:'String',
					StringValue: event_type
				}
			};
		}

		if(!_.has(this, 'eventHelperController')){
			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			this.eventHelperController = new EventHelperController();
		}

		return this.eventHelperController.pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}


	createAnalyticsActivityRecord(actor, action, acted_upon, associated_with){

		//Technical Debt:  This is inappropriate here...
		let ActivityHelper = global.SixCRM.routes.include('helpers', 'analytics/Activity.js');
		const activityHelper = new ActivityHelper();

		return activityHelper.createActivity(actor, action, acted_upon, associated_with);

	}

	transformListArray(list_array){

		du.debug('Transform List Array');

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

		du.debug('Execute Associated Entity Function');

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

		du.debug('Translate Controller Name To Filename');

		return stringutilities.uppercaseFirst(controller_name).replace('Controller', '')+'.js';

	}

	//Technical Debt:  Evaluate the utility of this method.
	createEndOfPaginationResponse(items_name, items) {

		du.debug('Create End Of Pagination Response');

		let pagination = {};

		pagination.count = items.length;
		pagination.end_cursor = '';
		pagination.has_next_page = false;

		let response = {};

		response[items_name] = items;
		response['pagination'] = pagination;

		du.debug('Returning', response);

		return Promise.resolve(response);

	}

	encryptAttributes(entity) {
		du.debug('Encrypt Attributes');
		return this.encryptionhelper.encryptAttributes(this.encrypted_attribute_paths, entity);
	}

	decryptAttributes(entity) {
		du.debug('Decrypt Attributes');
		return this.encryptionhelper.decryptAttributes(this.encrypted_attribute_paths, entity);
	}

	censorEncryptedAttributes(entity, custom_censor_fn) {
		du.debug('Censor Encrypted Attributes');
		return this.encryptionhelper.censorEncryptedAttributes(this.encrypted_attribute_paths, entity, custom_censor_fn);
	}

	/*
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
      */
}
