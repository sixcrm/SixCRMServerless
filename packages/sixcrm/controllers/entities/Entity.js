
const _ = require('lodash');
const chunk = require('chunk');
const BBPromise = require('bluebird');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const EntityPermissionsHelper = global.SixCRM.routes.include('helpers', 'entityacl/EntityPermissions.js');
const entityUtilitiesController = global.SixCRM.routes.include('controllers','entities/EntityUtilities');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
//Technical Debt:  This controller needs a "hydrate" method or prototype
//Technical Debt:  Deletes must cascade in some respect.  Otherwise, we are going to get continued problems in the Graph schemas
//Technical Debt:  We need a "inactivate"  method that is used more prolifically than the delete method is.
//Technical Debt:  Much of this stuff can be abstracted to a Query Builder class...
//Technical Debt:  Methods that use "primary key" as argumentation should derive that value from patent class
//Technical Debt:  Need notification settings to be bound to the accounts that they refer to?
//Technical Debt:  Need accesskey to be specific to the account?

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
			'notificationsetting', //userbound,
			'usersetting', //userbound
			'usersigningstring', //userbound
			'account', //self-referntial, implicit
			'bin', //not a cruddy endpoint
			'entityacl',
			'featureflag' //not related to the account model particularly
		];

		this.dynamodbprovider = new DynamoDBProvider();

	}

	getUnsharedOrShared({id}) {
		return this.get({id: id})
			.then(entity => {
				//Nick:  Let's make sure we do explicit checks.
				if (_.isNull(entity)) {
					return this.getShared({id: id});
				}

				return entity;

			});

	}

	getShared({id, range_key = null}) {
		let query_parameters = {
			key_condition_expression: 'entity = :primary_keyv',
			expression_attribute_values: {':primary_keyv': this.getID(id)}
		};

		if(_.has(this, 'range_key') && !_.isNull(range_key)){
			query_parameters.key_condition_expression += ' and '+this.range_key+' = :range_keyv';
			query_parameters.expression_attribute_values[':range_keyv'] = range_key;
		}

		return this.dynamodbprovider.queryRecords('entityacls', query_parameters, null)
			.then(data => this.getItems(data))
			.then(items => this.assureSingular(items))
			.then(acl => {

				if(_.isNull(acl) || !EntityPermissionsHelper.isShared('read', acl)){
					throw eu.getError('forbidden');
				}

				//Nick: Isn't this already defined?
				let query_parameters = {
					key_condition_expression: this.primary_key+' = :primary_keyv',
					expression_attribute_values: {':primary_keyv': this.getID(id)}
				};

				if(_.has(this, 'range_key') && !_.isNull(range_key)){
					query_parameters.key_condition_expression += ' and '+this.range_key+' = :range_keyv';
					query_parameters.expression_attribute_values[':range_keyv'] = range_key;
				}

				query_parameters = this.appendAccountFilter({query_parameters, account: '*'});
				return this.dynamodbprovider.queryRecords(this.table_name, query_parameters, null);

			})
			.then(data => this.getItems(data))
			.then(items => this.assureSingular(items));

	}

	listShared({pagination}) {
		let query_parameters = {
			key_condition_expression: '#type = :type',
			expression_attribute_values: {':type': this.descriptive_name},
			expression_attribute_names: { '#type': 'type' }
		};

		query_parameters = this.appendPagination({query_parameters, pagination});

		return this.dynamodbprovider.queryRecords('entityacls', query_parameters, 'type-index')
			.then(data => {
				const acls = this.getItems(data);

				let shared = arrayutilities.filter(acls, acl => EntityPermissionsHelper.isShared('read', acl))
				shared = arrayutilities.map(shared, acl => acl.entity);

				//Hasn't this already been defined?
				let query_parameters = this.createINQueryParameters({field: this.primary_key, list_array: shared});

				query_parameters = this.appendAccountFilter({query_parameters, account: '*'});

				return Promise.all([
					this.executeAssociatedEntityFunction('EntityACLController', 'buildPaginationObject', data),
					this.dynamodbprovider.scanRecords(this.table_name, query_parameters)
				]);

			})
			.then(([pagination, data]) => {
				const response = this.buildResponse(data);

				response.pagination = pagination;
				return response;
			});

	}

	//NOTE:  We need to make a designation when it's appropriate to list by account and when it's appropriate to list by user.
	listByAssociations({id, field, pagination, fatal}){
		return this.can({action:'read', object: this.descriptive_name, fatal: fatal})
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
			.then((query_parameters) => this.listByAccount({query_parameters: query_parameters, pagination: pagination}))
			.catch(this.handleErrors);

	}

	//Nick:  Please eliminate this function
	//Technical Debt:  Deprecate!
	//NOTE: Expensive (and incomplete)
	/* eslint-disable */
    listBySecondaryIndex({field, index_value, index_name, pagination, fatal}) {
		/* eslint-enable */
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {

				let query_parameters = {
					key_condition_expression: '#'+field+' = :index_valuev',
					expression_attribute_values: {':index_valuev': index_value},
					expression_attribute_names: {},
					filter_expression: '#'+field+' = :index_valuev'
				}

				query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});
				query_parameters = this.appendAccountFilter({query_parameters: query_parameters});

				return query_parameters;

			})
			.then((query_parameters) => this.dynamodbprovider.scanRecords(this.table_name, query_parameters))
			.then((data) => this.buildResponse(data))
		//Technical Debt:  Shouldn't this reference the fatal setting?
			.catch(this.handleErrors);

	}

	//Nick:  Please eliminate this function
	//Technical Debt:  Deprecate!
	//NOTE: Expensive
	listBy({list_array, field, fatal}){
		field = (_.isUndefined(field))?this.primary_key:field;

		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => this.transformListArray(list_array))
			.then((list_array) => {

				if(arrayutilities.nonEmpty(list_array)){
					return this.list({query_parameters: this.createINQueryParameters({field: field, list_array: list_array})});
				}

				return null;

			})
		//Technical Debt:  Shouldn't this reference the fatal setting?
			.catch(this.handleErrors);

	}

	//Technical Debt:  This does not necessarily return results of size "limit".  Next page can be true...
	//Technical Debt:  This needs to iterate until pagination specs are satisfied...
	//NOTE: Expensive!
	list({query_parameters = {}, pagination, reverse_order, account, fatal, search}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});
				query_parameters = this.appendAccountFilter({query_parameters: query_parameters, account: account});

				if (reverse_order) {
					query_parameters['scan_index_forward'] = false;
				}

				if(search){
					query_parameters = this.appendSearchConditions({query_parameters: query_parameters, search: search});
				}

				return query_parameters;

			})
			.then((query_parameters) => this.dynamodbprovider.scanRecords(this.table_name, query_parameters))
			.then((data) => this.buildResponse(data))
			.catch((error) => this.handleErrors(error, fatal));

	}

	listByUser({query_parameters, user, pagination, reverse_order, fatal, search, append_account_filter}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {

				query_parameters = this.appendUserCondition({query_parameters: query_parameters, user: user});
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});

				if (reverse_order) {
					query_parameters['scan_index_forward'] = false;
				}

				if(search){
					query_parameters = this.appendSearchConditions({query_parameters: query_parameters, search: search});
				}

				if (append_account_filter) {
					query_parameters = this.appendAccountFilter({query_parameters: query_parameters});
				}

				return query_parameters;

			})
			.then((query_parameters) => this.dynamodbprovider.queryRecords(this.table_name, query_parameters, 'user-index'))
			.then((data) => this.buildResponse(data))
			.catch((error) => this.handleErrors(error, fatal));

	}

	//Note:  When the query parameters have a filter expression, we need to implement a Six specific pagination...
	listByAccount({query_parameters, account, pagination, reverse_order, fatal, search, literal_master}){
		if(this.isMasterAccount() && !literal_master){
			return this.list(arguments[0]);
		}

		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {

				query_parameters = this.appendAccountCondition({query_parameters: query_parameters, account: account, literal_master: literal_master});
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});

				if (reverse_order) {
					query_parameters['scan_index_forward'] = false;
				}

				if(search){
					query_parameters = this.appendSearchConditions({query_parameters: query_parameters, search: search});
				}

				return query_parameters;

			})
			.then((query_parameters) => this.dynamodbprovider.queryRecords(this.table_name, query_parameters, 'account-index'))
			.then((data) => this.buildResponse(data))
			.catch((error) => this.handleErrors(error, fatal));

	}

	//Nick:  Let's get rid of these eslint-disable statements
	/* eslint-disable */
    getListByAccount({ids, query_parameters, account, pagination, reverse_order, fatal, search}){
		/* eslint-enable */
		ids = (_.isUndefined(ids))?[]:ids;
		let list_condition = this.createINQueryParameters({field: 'id', list_array: ids});

		let argumentation = arguments[0];

		if(_.isUndefined(argumentation.query_parameters)){
			argumentation.query_parameters = list_condition;
		}else{
			argumentation.query_parameters = objectutilities.merge(list_condition, argumentation.query_parameters);
		}

		return this.listByAccount(argumentation);

	}

	/* eslint-disable */
    getListByUser({ids, query_parameters, account, pagination, reverse_order, fatal, search}){
		/* eslint-enable */
		ids = (_.isUndefined(ids))?[]:ids;
		let list_condition = this.createINQueryParameters({field: 'id', list_array: ids});

		let argumentation = arguments[0];

		argumentation.query_parameters = objectutilities.merge(list_condition, argumentation.query_parameters);

		return this.listByUser(argumentation);

	}

	//Technical Debt:  You can only paginate against the index...
	queryBySecondaryIndex({query_parameters = {}, field, index_value, index_name, pagination, reverse_order, fatal}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {
				query_parameters = this.appendKeyConditionExpression(query_parameters, '#'+field+' = :index_valuev');
				query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
				query_parameters = this.appendExpressionAttributeValues(query_parameters, ':index_valuev', index_value);
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});
				query_parameters = this.appendAccountFilter({query_parameters: query_parameters});

				if (reverse_order) {
					query_parameters['scan_index_forward'] = false;
				}

				return query_parameters;
			})
			.then((query_parameters) => this.dynamodbprovider.queryRecords(this.table_name, query_parameters, index_name))
			.then((data) => this.buildResponse(data))
			.catch(this.handleErrors);

	}

	getBySecondaryIndex({query_parameters = {}, field, index_value, index_name, fatal}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {
				query_parameters = this.appendKeyConditionExpression(query_parameters, '#'+field+' = :index_valuev');
				query_parameters = this.appendExpressionAttributeNames(query_parameters, '#'+field, field);
				query_parameters = this.appendExpressionAttributeValues(query_parameters, ':index_valuev', index_value);

				return this.appendAccountFilter({query_parameters: query_parameters});

			})
			.then((query_parameters) => this.dynamodbprovider.queryRecords(this.table_name, query_parameters, index_name))
			.then(data => this.getItems(data))
			.then(items => this.assureSingular(items))
			.catch(this.handleErrors);

	}

	queryByParameters({parameters, pagination, index, fatal}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
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
				query_parameters = this.appendPagination({query_parameters: query_parameters, pagination: pagination});
				query_parameters = this.appendAccountFilter({query_parameters: query_parameters});

				if(_.has(parameters, 'reverse_order')) {
					query_parameters['scan_index_forward'] = !parameters.reverse_order;
				}

				return this.dynamodbprovider.queryRecords(this.table_name, query_parameters, index);

			})
			.then((data) => this.buildResponse(data))
			.catch(this.handleErrors);

	}

	get({id, fatal, range_key = null}){
		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {

				let query_parameters = {
					key_condition_expression: this.primary_key+' = :primary_keyv',
					expression_attribute_values: {':primary_keyv': this.getID(id)}
				};

				if(_.has(this, 'range_key') && !_.isNull(range_key)){
					query_parameters.key_condition_expression += ' and '+this.range_key+' = :range_keyv';
					query_parameters.expression_attribute_values[':range_keyv'] = range_key;
				}

				query_parameters = this.appendAccountFilter({query_parameters: query_parameters});

				return this.dynamodbprovider.queryRecords(this.table_name, query_parameters, null);

			})
			.then((data) => this.getItems(data))
			.then(items => this.assureSingular(items))
			.catch((error) => {
				return this.handleErrors(error, fatal)
			});

	}


	async batchGet({ids, parameters}) {
		const permission = await this.can({action: 'read', object: this.descriptive_name});
		this.catchPermissions(permission, 'read');

		try {

			const chunks = chunk(ids, 100);

			return BBPromise.reduce(chunks, async (memo, ids) => {

				const data = await this.dynamodbprovider.batchGet({table_name: this.table_name, ids: ids, parameters: parameters});
				memo.push(...data[this.table_name]);
				return memo;

			}, []);

		} catch (ex) {

			return this.handleErrors(ex);

		}

	}

	//Technical Debt:  Could a user authenticate using his credentials and create an object under a different account (aka, account specification in the entity doesn't match the account
	create({entity, parameters = { index: true }}){
		return this.can({action: 'create', object: this.descriptive_name, fatal: true})
			.then(() => {

				entity = this.assignPrimaryKey(entity);
				entity = this.assignAccount(entity);
				entity = this.setCreatedAt(entity);

				return true;
			})
			.then(() => this.validate(entity))
			.then(() => this.exists({entity: entity}))
			.then((exists) => {

				if(exists !== false){
					throw eu.getError('bad_request','A '+this.descriptive_name+' already exists with '+this.primary_key+': "'+entity[this.primary_key]+'"');
				}

				return true;
			})
			.then(() => this.encryptAttributes(entity))
			.then(() => this.dynamodbprovider.saveRecord(this.table_name, entity))
			.then(() => {
				if (this.sanitization) {
					return this.censorEncryptedAttributes(entity);
				} else {
					return this.decryptAttributes(entity);
				}
			})
			.then(() => {

				if (parameters.index) {

					this.createAnalyticsActivityRecord(null, 'created', {entity: entity, type: this.descriptive_name}, null);

				}

				return entity;

			});

	}

	updateProperties({id, properties}){
		return this.can({action: 'update', object: this.descriptive_name, id: this.getID(id), fatal: true})
			.then(() => this.exists({entity: id, return_entity: true}))
			.then((existing_entity) => {

				if(existing_entity === null){
					throw eu.getError('not_found','Unable to update '+this.descriptive_name+' with ID: "'+id+'" -  record doesn\'t exist.');
				}

				return existing_entity;

			}).then((existing_entity) => {

				objectutilities.map(properties, key => {
					if(!_.includes(['account', 'user', 'created_at', this.primary_key], key)){
						existing_entity[key] = properties[key];
					}else{
						throw eu.getError('bad_request', 'You can not use updateProperties to update a entity\'s '+key+' property');
					}
				});

				existing_entity = this.setUpdatedAt(existing_entity);

				return existing_entity;

			}).then((existing_entity) => {

				this.validate(existing_entity);
				return existing_entity;

			}).then((existing_entity) => {

				this.encryptAttributes(existing_entity);
				return this.dynamodbprovider.saveRecord(this.table_name, existing_entity).then(() => {
					return existing_entity;
				});

			}).then((existing_entity) => {

				if (this.sanitization) {
					return this.censorEncryptedAttributes(existing_entity);
				} else {
					return this.decryptAttributes(existing_entity);
				}

			}).then((existing_entity) => {

				this.createAnalyticsActivityRecord(null, 'updated', {entity: existing_entity, type: this.descriptive_name}, null);

				return existing_entity;

			});

	}

	//Technical Debt:  Could a user authenticate using his credentials and update an object under a different account (aka, account specification in the entity doesn't match the account)
	update({entity, ignore_updated_at}){
		if(!_.has(entity, this.primary_key)){
			throw eu.getError('bad_request','Unable to update '+this.descriptive_name+'. Missing property "'+this.primary_key+'"');
		}

		if(_.has(this, 'range_key') && !_.has(entity, this.range_key)){
			throw eu.getError('bad_request','Unable to update '+this.descriptive_name+'. Missing property "'+this.range_key+'"');
		}

		let can_arguments = {action: 'update', object: this.descriptive_name, id: entity[this.primary_key], fatal: true}

		if(_.has(this, 'range_key')){
			can_arguments.range_key = entity[this.range_key];
		}

		return this.can(can_arguments)
			.then(() => this.exists({entity: entity, return_entity: true}))
			.then((existing_entity) => {

				if(existing_entity === null){
					throw eu.getError('not_found','Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist.');
				}

				return existing_entity;

			})
			.then((existing_entity) => {

				if(_.isUndefined(ignore_updated_at) || ignore_updated_at !== true){

					if(entity.updated_at !== existing_entity.updated_at){
						throw eu.getError('bad_request', `Mismatched updated_at timestamps - can not update ${this.descriptive_name}.`);
					}

				}

				return existing_entity;

			})
			.then((existing_entity) => {

				if (existing_entity.account) {
					if(!_.includes(this.nonaccounts, this.descriptive_name)){
						entity.account = existing_entity.account;
					}
				}
				entity = this.assignAccount(entity);
				entity = this.persistCreatedUpdated(entity, existing_entity);
				entity = this.setUpdatedAt(entity);

				return true;
			})
			.then(() => this.validate(entity))
			.then(() => this.encryptAttributes(entity))
			.then(() => this.dynamodbprovider.saveRecord(this.table_name, entity))
			.then(() => {
				if (this.sanitization) {
					return this.censorEncryptedAttributes(entity);
				} else {
					return this.decryptAttributes(entity);
				}
			})
			.then(() => {

				this.createAnalyticsActivityRecord(null, 'updated', {entity: entity, type: this.descriptive_name}, null);

				return entity;

			});

	}

	touch({entity}){
		return this.can({action: 'update', object: this.descriptive_name, fatal: true}).then(() => {

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
	store({entity, ignore_updated_at}){
		ignore_updated_at = (_.isUndefined(ignore_updated_at) || _.isNull(ignore_updated_at))?false:ignore_updated_at;

		if(!_.has(entity, this.primary_key)){

			return this.create({entity: entity});

		}else{

			entity = this.assignAccount(entity);

			return this.exists({entity: entity}).then((exists) => {

				if(exists === false){

					return this.create({entity: entity});

				}else{

					return this.update({entity: entity, ignore_updated_at: ignore_updated_at});

				}

			});

		}

	}

	//NOT ACL enabled
	delete({id, range_key = null}){
		let delete_parameters = {};

		delete_parameters[this.primary_key] = id;
		if(_.has(this, 'range_key')){
			delete_parameters[this.range_key] = range_key;
		}


		return this.can({action: 'delete', object: this.descriptive_name, fatal: true})
			.then(() => this.checkAssociatedEntities({id: id}))
			.then(() => this.exists({entity: delete_parameters}))
			.then((exists) => {
				if(!exists){
					throw eu.getError('not_found','Unable to delete '+this.descriptive_name+' with '+this.primary_key+': "'+id+'" -  record doesn\'t exist or multiples returned.');
				}
				return true;
			})
			.then(() => this.dynamodbprovider.deleteRecord(this.table_name, delete_parameters, null, null))
			.then(() => {

				return delete_parameters;

			});

	}

	//Note: UTILITY Method - has no permissioning... DANGER
	exists({entity, return_entity}){
		let primary_key;

		if(_.isObject(entity)){
			if(!_.has(entity, this.primary_key)){
				throw eu.getError('server', 'Unable to create '+this.descriptive_name+'. Missing property "'+this.primary_key+'"');
			}
			primary_key = entity[this.primary_key];
		}else{
			primary_key = entity;
		}

		return_entity = _.isUndefined(return_entity)?false:return_entity;

		let query_parameters = {
			key_condition_expression: this.primary_key+' = :primary_keyv',
			expression_attribute_values: {':primary_keyv': primary_key}
		};

		if(_.has(this, 'range_key')){
			if(!_.has(entity, this.range_key)){
				throw eu.getError('server', 'Unable to create '+this.descriptive_name+'. Missing property "'+this.range_key+'"');
			}
			query_parameters.key_condition_expression += ' and '+this.range_key+' = :range_keyv';
			query_parameters.expression_attribute_values[':range_keyv'] = entity[this.range_key];
		}

		query_parameters = this.appendAccountFilter({query_parameters: query_parameters});

		return this.dynamodbprovider.queryRecords(this.table_name, query_parameters, null)
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

	getCount({parameters, index, fatal}) {
		if (_.isUndefined(fatal)) {
			fatal = false;
		}

		return this.can({action: 'read', object: this.descriptive_name, fatal: fatal})
			.then((permission) => this.catchPermissions(permission, 'read'))
			.then(() => {
				parameters = this.appendAccountFilter({query_parameters: parameters});

				return this.dynamodbprovider.countRecords(this.table_name, parameters, index);
			})
	}

	checkAssociatedEntities({id}){
		if(_.isFunction(this.associatedEntitiesCheck)){

			return this.associatedEntitiesCheck({id: id}).then(associated_entities => {

				global.SixCRM.validate(associated_entities, global.SixCRM.routes.path('model', 'general/associated_entities_response.json'));

				if(arrayutilities.nonEmpty(associated_entities)){

					let entity_name = this.getDescriptiveName();

					throw eu.getError(
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
		//Technical Debt:  Not every entity has "ID"
		if(!_.has(object, 'id')){
			throw eu.getError('server', 'Create Associated Entities expects the object parameter to have field "id"');
		}

		return {
			name: name,
			entity: {
				id: object.id
			}
		};

	}

	createINQueryParameters({field, list_array}){
		return this.dynamodbprovider.createINQueryParameters(field, list_array);

	}

	appendDisjunctionQueryParameters({query_parameters, field_name, array }){

		return this.dynamodbprovider.appendDisjunctionQueryParameters(query_parameters, field_name, array);

	}

}
