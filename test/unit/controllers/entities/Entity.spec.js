

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const uuidV4 = require('uuid/v4');
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/Entity.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('getShared', () => {
		it('returns the entity if shared', () => {
			let entity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');
			let entityAcl = {
				entity: '82478014-c96f-49ef-b31c-5408e99df66e',
				type: 'accesskey',
				allow: ['*'],
				deny: ['*']
			};

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					if (table === 'entityacls') {
						return Promise.resolve({Items: [entityAcl]});
					}
					return Promise.resolve({Items: [entity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getShared({id:entity.id}).then(result => {
				expect(result).to.deep.equal(entity);
			});
		});

		it('returns throws an error if not shared', () => {
			let entity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');
			let entityAcl = {
				entity: '82478014-c96f-49ef-b31c-5408e99df66e',
				type: 'accesskey',
				allow: [],
				deny: ['*']
			};

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					if (table === 'entityacls') {
						return Promise.resolve({Items: [entityAcl]});
					}
					return Promise.resolve({Items: [entity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getShared({id: entity.id}).catch(error => {
				expect(error.message).to.equal('[403] User is not authorized to perform this action.');
			});
		});

		it('queries entities belonging to master account', () => {
			let entity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');
			let entityAcl = {
				entity: '82478014-c96f-49ef-b31c-5408e99df66e',
				type: 'accesskey',
				allow: ['*'],
				deny: ['*']
			};

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					if (table === 'entityacls') {
						return Promise.resolve({Items: [entityAcl]});
					}
					expect(parameters.expression_attribute_values[':accountv']).to.equal('*');
					expect(parameters.filter_expression).to.equal('account = :accountv');
					return Promise.resolve({Items: [entity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getShared({id: entity.id});
		});
	});

	describe('listShared', () => {
		it('returns a list of shared entities corresponding to type', () => {
			PermissionTestGenerators.givenAnyUser();
			const acls = [{
				entity: 'ead02cb4-61f9-49de-bd08-e9192718e75d',
				type: 'type',
				allow: [],
				deny: []
			}, {
				entity: '2a5f786d-69fb-44ea-ad2f-137bb515543c',
				type: 'type',
				allow: [],
				deny: ['*']
			}];
			const sharedEntities = [{
				id: 'ead02cb4-61f9-49de-bd08-e9192718e75d'
			}];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Count: acls.length, Items: acls })
				}
				scanRecords() {
					return Promise.resolve({ Count: sharedEntities.length, Items: sharedEntities })
				}
				createINQueryParameters() {
					return {
						filter_expression: 'a_filter',
						expression_attribute_values: {}
					};
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listShared({pagination: {limit: 10}}).then(result => {
				expect(result.entities).to.deep.equal(sharedEntities);
			});
		});

		it('paginates the shared entities', () => {
			PermissionTestGenerators.givenAnyUser();
			const params = {
				pagination: {
					limit: 2
				}
			};
			const acls = [{
				entity: 'ead02cb4-61f9-49de-bd08-e9192718e75d',
				type: 'type',
				allow: [],
				deny: []
			}, {
				entity: 'f683e149-874a-4572-85b0-afa7c1c5b4dd',
				type: 'type',
				allow: [],
				deny: []
			}];
			const entities = [{
				id: 'ead02cb4-61f9-49de-bd08-e9192718e75d'
			}, {
				id: 'f683e149-874a-4572-85b0-afa7c1c5b4dd'
			}];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(parameters.limit).to.equal(params.pagination.limit);
					return Promise.resolve({ Count: acls.length, LastEvaluatedKey: acls[acls.length - 1], Items: acls })
				}
				scanRecords() {
					return Promise.resolve({ Count: entities.length, Items: entities })
				}
				createINQueryParameters() {
					return {
						filter_expression: 'a_filter',
						expression_attribute_values: {}
					};
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listShared(params).then(result => {
				expect(result).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: 'f683e149-874a-4572-85b0-afa7c1c5b4dd',
						has_next_page: 'true',
						last_evaluated: '{"entity":"f683e149-874a-4572-85b0-afa7c1c5b4dd","type":"type","allow":[],"deny":[]}'
					},
					entities: entities
				});
			});
		});


		it('queries entities belonging to master account', () => {
			PermissionTestGenerators.givenAnyUser();
			const acls = [];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Count: acls.length, Items: acls })
				}
				scanRecords(table, parameters) {
					expect(parameters.expression_attribute_values[':accountv']).to.equal('*');
					expect(parameters.filter_expression).to.include('account = :accountv');
					return Promise.resolve({ Count: 0, Items: [] });
				}
				createINQueryParameters() {
					return {
						filter_expression: 'a_filter',
						expression_attribute_values: {}
					};
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listShared({pagination: {limit: 10}});
		});
	});

	describe('create', () => {

		beforeEach(() => {
			//global.SixCRM.localcache.clear('all');
			delete global.user;
		});

		it('fails when user is not defined', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			try{
				entityController.create({entity: {}})
			}catch(error){
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}

		});

		it('returns entity when saving succeeds', () => {
			// given
			let anEntity = {
				secret_key:"secret-key",
				access_key:"access-key"
			};

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.create({entity: anEntity}).then((result) => {

				du.info(result);

				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result).to.have.property('id');
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			}).catch(error => {

				du.error(error);

			});
		});

		it('fails entity with given id already exists', () => {

			let anEntity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.create({entity: anEntity}).catch((error) => {
				// then
				expect(error.message).to.equal(`[400] A accesskey already exists with id: "${anEntity.id}"`);
			});
		});

		it('throws error when reading from database fails', () => {

			let anEntity = MockEntities.getValidAccessKey();

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					throw eu.getError('server','Reading failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.create({entity: anEntity}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Reading failed.');
			});
		});
	});

	//Technical Debt:  Need better testing on this.
	describe('updateProperties', () => {

		beforeEach(() => {
			delete global.user;
		});

		it('successfully updates a entity property', () => {

			let anEntity = MockEntities.getValidProduct('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			PermissionTestGenerators.givenUserWithAllowed('update', 'product');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('product');

			let update_properties = {
				name: 'A new name',
				sku: 'A-brand-new-sku'
			};

			return entityController.updateProperties({id: anEntity.id, properties: update_properties}).then((result) => {

				expect(result.id).to.equal(anEntity.id);
				expect(result.created_at).to.equal(anEntity.created_at);
				expect(result.account).to.equal(anEntity.account);
				//expect(result.updated_at).to.not.equal(anEntity.updated_at);
				objectutilities.map(update_properties, key => {
					expect(result[key]).to.equal(update_properties[key]);
				});

			});

		});

	});

	describe('update', () => {

		beforeEach(() => {
			//global.SixCRM.localcache.clear('all');
			delete global.user;
		});

		it('fails when user is not defined', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			try {
				entityController.update({entity: {id: 'dummy-id'}})
			}catch(error){
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}

		});

		it('throws error when reading from database fails', () => {
			// given
			let anEntity = {
				id:"82478014-c96f-49ef-b31c-5408e99df66f",
				secret_key:"secret-key",
				access_key:"access-key"
			};

			PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					throw eu.getError('server','Reading failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.update({entity: anEntity}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Reading failed.');

			});
		});

		it('fails when primary key is missing', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			try {
				entityController.update({entity: {}})
			}catch(error){
				expect(error.message).to.equal('[400] Unable to update ' + entityController.descriptive_name
                    + '. Missing property "' + entityController.primary_key + '"');
			}

		});

		it('fail when entity with specified id does not exist', () => {
			// given
			let anEntity = {
				secret_key: "secret-key",
				access_key: "access-key",
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.update({entity: anEntity}).catch((error) => {
				expect(error.message).to.equal('[404] Unable to update ' + entityController.descriptive_name +
                    ' with ID: "' + anEntity.id + '" -  record doesn\'t exist.');
			});
		});

		it('master account does not hijack ownership', () => {
			// given
			let anEntity = {
				"id": "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
				"account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
				"name": "Test Product",
				"description":"This is a test description",
				"sku":"123",
				"ship":true,
				"created_at":"2017-04-06T18:40:41.405Z",
				"updated_at":"2017-04-06T18:40:41.405Z"
			};

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');
			global.account = '*';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});


			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('product');

			// when
			return entityController.update({entity: anEntity}).then((updatedEntity) => {
				expect(updatedEntity.account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');
			});
		});
	});

	describe('delete', () => {

		beforeEach(() => {
			//global.SixCRM.localcache.clear('all');
			delete global.user;
		});

		afterEach(() => {
			delete global.user;
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('fails when user is not defined', () => {
			// given
			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			try{
				entityController.delete({id:{}})
			}catch(error){
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}

		});

		it('throws error when reading from database fails', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					throw eu.getError('server', 'Reading failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.delete({id: anEntity.id}).catch((error) => {
				expect(error.message).to.equal('[500] Reading failed.');
			});
		});

		it('throws error when deleting from database fails', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[anEntity]});
				}
				deleteRecord() {
					throw eu.getError('server','Deleting failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.delete({id: anEntity.id}).catch((error) => {
				expect(error.message).to.equal('[500] Deleting failed.');
			});
		});

		it('throws error when there are no entities with given id', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[]});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.delete({id: anEntity.id}).catch((error) => {
				// then
				expect(error.message).to.equal(`[404] Unable to delete accesskey with id: "${anEntity.id}" -  record doesn't exist or multiples returned.`);

			});

		});

		it('throws error when there are multiple entities with given id', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[anEntity, anEntity]});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.delete({id: anEntity.id}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Non-specific accesskey entity results.');

			});
		});

		it('succeeds when deleting succeeds', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[anEntity]});
				}
				deleteRecord() {
					return Promise.resolve(anEntity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('accesskey');

			// when
			return entityController.delete({id: anEntity.id}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Deleting failed.');
			});
		});
	});

	describe('get', () => {
		afterEach(() => {
			mockery.resetCache();
			//global.SixCRM.localcache.clear('all');
			delete global.user;
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('fails when user is not defined', () => {
			// given
			global.user = null;

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('entity');

			try{
				entityController.get({id: 1});
			}catch(error){
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}

		});

		it('gets the entity from database when has permissions and entity exists', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('entity');

			// when
			return entityController.get({id: anEntity.id}).then((response) => {
				// then
				expect(response).to.equal(anEntity);
			});
		});

		it('throws error when reading from database fails', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					throw eu.getError('server','Reading failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
			let entityController = new EC('entity');

			// when
			return entityController.get({id: anEntity.id}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Reading failed.');

			});
		});

		it('throws error when reading from database returns more than 1 result', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[anEntity, anEntity]});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.get({id: anEntity.id}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Non-specific entity entity results.');
			});
		});

		it('returns null when there are no results', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items:[]});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.get({id: anEntity.id}).then((result) => {
				// then
				expect(result).to.equal(null);
			});
		});

		it('throws error when has no permissions', () => {
			// given
			let anEntity = {
				id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
			};

			PermissionTestGenerators.givenUserWithDenied('read', 'entity');

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.get({id: anEntity.id}).then((response) => {
				// then
				expect(response).to.equal(null);
			}).catch(error => {
				expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
			})
		});
	});

	describe('list', () => {
		afterEach(() => {
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('can\'t list without permissions', () => {
			// given
			PermissionTestGenerators.givenUserWithDenied('read', 'entity');

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.list({pagination:{limit: 10}})
				.catch(error => {
					expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
				});

		});

		it('throws an error when data has no Items', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords() {
					return Promise.resolve({Items: [], LastEvaluatedKey: {id: 1}});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.list({pagination:{limit: 10}}).catch((error) => {
				// then
				expect(error.message).to.equal('[404] Data has no items.');
			});
		});

		it('throws an error when data is not an object', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords() {
					return Promise.resolve('');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.list({pagination:{limit: 10}}).catch((error) => {

				expect(error.message).to.equal('[500] Thing is not an object.');
			});
		});

		it('throws an error when scanning data fails', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords() {
					throw eu.getError('server','Scanning failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.list({pagination:{limit: 10}}).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Scanning failed.');
			});
		});

		it('returns empty data when there are none', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords() {
					return Promise.resolve({Count: 0,Items: []});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.list({pagination:{limit: 10}}).then((response) => {
				// then
				expect(response).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: null
				});
			});
		});

		it('returns data when there is any', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords() {
					return Promise.resolve({
						Count: 10,
						Items: [{},{},{},{},{},{},{},{},{},{}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.list({pagination:{limit:10}}).then((response) => {
				// then
				expect(response).to.deep.equal({
					pagination: {
						count: 10,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{},{},{},{},{},{},{},{},{}]
				});
			});
		});

	});

	describe('queryBySecondaryIndex', () => {
		afterEach(() => {
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		it('can\'t list without permissions', () => {
			// given
			PermissionTestGenerators.givenUserWithDenied('read', 'entity');

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
				// then
				expect(response).to.equal(null);
			}).catch(error => {
				expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
			});
		});

		it('returns null when result is not an array', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Items: 'non array' });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
				// then
				expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
			});
		});

		it('throws an error when querying data fails', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					throw eu.getError('server','Query failed.');
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
				// then
				expect(error.message).to.equal('[500] Query failed.');
			});
		});

		it('returns null when there are no results', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Items: [] });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
				// then
				expect(response.entities).to.equal(null);
			});
		});

		it('returns data when there is any', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Items: [{},{}] });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			// when
			return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
				// then
				expect(response.entities).to.deep.equal([{}, {}]);
			});
		});

	});

	describe('isEmail', () => {

		it('should allow valid mail', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			let validEmails = [];

			validEmails.push('test@example.com');
			validEmails.push('test@example.co.uk');

			for (let email of validEmails) {

				expect(entityController.isEmail(email)).to.equal(true, `'${email}' should be considered a valid email but is not.`)

			}

		});

		it('should disallow invalid mail', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			let invalidEmails = [];

			invalidEmails.push('test@');
			invalidEmails.push('example.co.uk');
			invalidEmails.push('@');
			invalidEmails.push('a@b');
			invalidEmails.push('test.@example.com');
			invalidEmails.push('test@.example.com');
			invalidEmails.push(null);
			invalidEmails.push();
			invalidEmails.push({});
			invalidEmails.push(['email@example.com']);

			for (let email of invalidEmails) {
				expect(entityController.isEmail(email)).to.equal(false, `'${email}' should not be considered valid.`)
			}

		});
	});

	describe('isUUID', () => {
		let entityController;

		beforeEach(() => {
			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			entityController = new EC('entity');
		});

		it('should allow valid UUID', () => {
			let validUUIDs = [
				/*
              //we don't support v1
              {
                uuid:'dbf6cbca-12fa-11e7-93ae-92361f002671',
                version: 1
              },
              */
				{
					uuid:'2e9b9869-f0f6-4de9-b62e-ce511acd71de',
					version: 4
				}
			];

			for(let uuid of validUUIDs) {
				expect(entityController.isUUID(uuid.uuid, uuid.version)).to.equal(true, `'${uuid.uuid}' should be considered a valid UUID but is not.`)
			}
		});

		it('should disallow invalid UUID', () => {
			let invalidUUIDs = [];

			invalidUUIDs.push('abcd');
			invalidUUIDs.push('dbf6cbca-12fa-11e7-93ae-');
			invalidUUIDs.push('-');
			invalidUUIDs.push(null);
			invalidUUIDs.push();
			invalidUUIDs.push({});
			invalidUUIDs.push(['email@example.com']);

			for (let uuid of invalidUUIDs) {
				expect(entityController.isUUID(uuid)).to.equal(false, `'${uuid}' should not be considered valid.`)
			}
		});
	});

	describe('store', () => {

		beforeEach(() => {

			let mock_preindexing_helper = class {
				constructor() {}

				addToSearchIndex() {
					return Promise.resolve(true);
				}

				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});
		});

		it('stores entity if it has a primary key', () => {

			let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.store({entity: anEntity}).then((result) => {
				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result.id).to.equal(anEntity.id);
				expect(result).to.have.property('id');
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			});
		});

		it('updates existing entity', () => {

			let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.store({entity: anEntity}).then((result) => {
				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result.id).to.equal(anEntity.id);
				expect(result).to.have.property('id');
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			});
		});

		it('stores entity when it doesn\'t have a primary key', () => {

			let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			delete anEntity.id;

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.store({entity: anEntity}).then((result) => {
				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			});
		});
	});

	describe('touch', () => {

		beforeEach(() => {

			let mock_preindexing_helper = class {
				constructor() {}

				addToSearchIndex() {
					return Promise.resolve(true);
				}

				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});
		});

		it('creates entity if it does not exist', () => {

			let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			PermissionTestGenerators.givenUserWithAllowed('*', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.touch({entity: anEntity}).then((result) => {
				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result).to.have.property('id');
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			});
		});

		it('updates entity if it already exists', () => {

			let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

			PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [anEntity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			let entityController = new EC('accesskey');

			// when
			return entityController.touch({entity: anEntity}).then((result) => {
				expect(result.secret_key).to.equal(anEntity.secret_key);
				expect(result.access_key).to.equal(anEntity.access_key);
				expect(result).to.have.property('id');
				expect(result).to.have.property('created_at');
				expect(result).to.have.property('updated_at');

			});
		});
	});

	describe('createAssociatedEntitiesObject', () => {

		it('fails when object is missing id property', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			try{
				entityController.createAssociatedEntitiesObject({name: 'a_name', object: {}})
			}catch(error){
				expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
			}
		});

		it('creates associated entities object', () => {
			let param = {
				name: 'a_name',
				object: {
					id: 'dummy_id'
				}
			};

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			expect(entityController.createAssociatedEntitiesObject(param))
				.to.deep.equal({name: param.name, entity: {id: param.object.id}});
		});
	});

	describe('listByUser', () => {

		it('returns data when there is any', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByUser({pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('list user with search parameters and reverse order', () => {

			let params = {
				pagination: {
					limit: 2
				},
				search: {
					updated_at: {
						after: ['any_data']
					}
				},
				reverse_order: true
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
					expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
					expect(parameters.limit).to.equal(params.pagination.limit);
					expect(parameters.scan_index_forward).to.equal(false);
					expect(parameters.filter_expression).to.equal('#updated_at_after_k > :updated_at_after_v');
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByUser(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('list user, filter by account', () => {

			let params = {
				pagination: {
					limit: 2
				},
				search: {
					updated_at: {
						after: ['any_data']
					}
				},
				reverse_order: true,
				append_account_filter: true
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
					expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
					expect(parameters.limit).to.equal(params.pagination.limit);
					expect(parameters.expression_attribute_values[':accountv']).to.equal(global.account);
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByUser(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('returns empty data when there are none', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Count: 0,Items: []});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByUser({pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: null
				});
			});
		});
	});

	describe('listByAccount', () => {

		it('returns data when there is any', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByAccount({pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('successfully lists by account with search and reverse order parameters', () => {

			let params = {
				pagination: {
					limit: 2
				},
				search: {
					updated_at: {
						after: ['any_data']
					}
				},
				reverse_order: true
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
					expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
					expect(parameters.limit).to.equal(params.pagination.limit);
					expect(parameters.scan_index_forward).to.equal(false);
					expect(parameters.filter_expression).to.equal('#updated_at_after_k > :updated_at_after_v');
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByAccount(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('returns empty data when there are none', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Count: 0,Items: []});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.listByAccount({pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: null
				});
			});
		});
	});

	describe('getListByAccount', () => {

		it('retrieves list by account', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
				createINQueryParameters() {
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getListByAccount({pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});

		it('retrieves list by account with specified query parameters', () => {

			let params = {
				query_parameters: {
					any_data: 'any_data'
				},
				pagination: {
					limit: 2
				}
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(table).to.equal('entities');
					expect(index).to.equal('account-index');
					expect(parameters.any_data).to.equal(params.query_parameters.any_data);
					expect(parameters.filter_expression).to.equal('a_filter');
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
				createINQueryParameters(field) {
					expect(field).to.equal('id');
					return {
						filter_expression: 'a_filter',
						expression_attribute_values: {}
					}
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getListByAccount(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});
	});

	describe('getListByUser', () => {

		it('retrieves list by user', () => {
			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
				createINQueryParameters() {
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getListByUser({query_parameters: {}, pagination:{limit:2}}).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});
	});

	describe('getBySecondaryIndex', () => {

		it('successfully retrieves by secondary index', () => {

			let params = {
				field:'field',
				index_value:'index_value',
				index_name:'index_name'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal(params.index_name);
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values).to.have.property(':index_valuev');
					expect(parameters.expression_attribute_values).to.have.property(':accountv');
					return Promise.resolve({ Items: [{a_single_item: 'a_single_item'}] });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getBySecondaryIndex(params).then((response) => {
				expect(response).to.deep.equal({a_single_item: 'a_single_item'});
			});
		});
	});

	describe('queryByParameters', () => {

		it('returns data retrieved by specified expressions', () => {

			let params = {
				parameters:{
					filter_expression:'filter_expression',
					expression_attribute_values:{
						expression_attribute_value:'expression_attribute_value'
					},
					expression_attribute_names:{
						expression_attribute_name:'expression_attribute_name'
					},
					reverse_order: true
				},
				pagination:{limit:2},
				index:'an_index'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal(params.index);
					expect(table).to.equal('entities');
					expect(parameters.scan_index_forward).to.equal(false);
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({ Count:2, Items: [{}, {}] });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.queryByParameters(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});
	});

	//Note:  Method eliminated
	xdescribe('scanByParameters', () => {

		it('successfully scans by specified expressions', () => {

			let params = {
				parameters:{
					filter_expression:'filter_expression',
					expression_attribute_values:{
						expression_attribute_value:'expression_attribute_value'
					},
					expression_attribute_names:{
						expression_attribute_name:'expression_attribute_name'
					}
				},
				pagination:{limit:2}
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords(table, parameters) {
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({ Count:2, Items: [{}, {}] });
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.scanByParameters(params).then((response) => {
				expect(response).to.deep.equal({
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					entities: [{},{}]
				});
			});
		});
	});

	describe('checkAssociatedEntities', () => {

		it('throws error when appointed entity is associated with other entities', () => {

			let entity_name = 'entity';

			let associated_entities = {
				name: 'a_name',
				entity: {
					type: {},
					id: uuidV4()
				}
			};

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC(entity_name);

			entityController.associatedEntitiesCheck = () => {
				return Promise.resolve([associated_entities]);
			};

			return entityController.checkAssociatedEntities({id:'dummy_id'}).catch((error) => {
				expect(error.message).to.deep.equal('[403] The ' + entity_name + ' entity that you are attempting to delete ' +
                    'is currently associated with other entities.  Please delete the entity associations before ' +
                    'deleting this ' + entity_name + '.');
			});
		});

		it('returns true when entity is not associated with other entites', () => {

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			entityController.associatedEntitiesCheck = () => {
				return Promise.resolve([]);
			};

			return entityController.checkAssociatedEntities({id:'dummy_id'}).then((result) => {
				expect(result).to.be.true;
			});
		});
	});

	describe('getCount', () => {

		it('successfully returns record count', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				countRecords(table, additional_parameters) {
					expect(table).to.equal('entities');
					expect(additional_parameters).to.have.property('filter_expression');
					expect(additional_parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({ Count: 1});
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			return entityController.getCount({}).then((response) => {
				expect(response).to.deep.equal({Count: 1});
			});
		});
	});

	describe('createINQueryParameters', () => {

		it('successfully creates in query parameters', () => {

			let params = {
				field: 'a_field',
				list_array: ['an_item']
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				createINQueryParameters(field_name, in_array) {
					expect(field_name).to.equal(params.field);
					expect(in_array).to.equal(params.list_array);
					return {
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					};
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			expect(entityController.createINQueryParameters(params)).to.deep.equal({
				filter_expression: 'a_filter',
				expression_attribute_values: 'an_expression_values'
			});
		});
	});

	describe('appendDisjunctionQueryParameters', () => {

		it('successfully creates in query parameters', () => {

			let params = {
				field_name: 'a_field',
				array: ['an_item'],
				query_parameters: {}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				appendDisjunctionQueryParameters() {
					return {
						expression_attribute_names: {
							"#a_field": "a_field"
						},
						expression_attribute_values: {
							":a_fieldv0": "an_item"
						},
						filter_expression: "(#a_field = :a_fieldv0)"
					};
				}
			});

			const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
			let entityController = new EC('entity');

			expect(entityController.appendDisjunctionQueryParameters(params)).to.deep.equal({
				expression_attribute_names: {
					"#a_field": "a_field"
				},
				expression_attribute_values: {
					":a_fieldv0": "an_item"
				},
				filter_expression: "(#a_field = :a_fieldv0)"
			});
		});
	});

	describe('encryptAttributes', () => {
		it('runs encryption on attributes listed in encryptedAttributes', () => {
			mockery.registerMock(global.SixCRM.routes.path('lib', 'encryption-utilities.js'), {
				encryptAES256: (iv_key, input) => {
					expect(iv_key).to.equal('entity_id');
					expect(input).to.equal('sensitive_data');
					return 'encrypted_data'
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { id: 'entity_id', foo: 'plaintext_data', bar: 'sensitive_data' };

			entityController.encrypted_attribute_paths = ['bar'];
			entityController.encryptAttributes(subject);

			expect(subject).to.deep.equal({
				id: 'entity_id',
				foo: 'plaintext_data',
				bar: 'encrypted_data'
			});
		});

		it('handles deep attribute paths', () => {
			mockery.registerMock(global.SixCRM.routes.path('lib', 'encryption-utilities.js'), {
				encryptAES256: (iv_key, input) => {
					expect(iv_key).to.equal('entity_id');
					expect(input).to.equal('sensitive_data');
					return 'encrypted_data'
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { id: 'entity_id', foo: { bar: { baz: 'sensitive_data' } } };

			entityController.encrypted_attribute_paths = ['foo.bar.baz'];
			entityController.encryptAttributes(subject);

			expect(subject).to.deep.equal({ id: 'entity_id', foo: { bar: { baz: 'encrypted_data' } } });
		});
	});

	describe('decryptAttributes', () => {
		it('runs decryption on attributes listed in encryptedAttributes', () => {
			mockery.registerMock(global.SixCRM.routes.path('lib', 'encryption-utilities.js'), {
				decryptAES256: (iv_key, input) => {
					expect(iv_key).to.equal('entity_id');
					expect(input).to.equal('encrypted_data');
					return 'sensitive_data'
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { id: 'entity_id', foo: 'plaintext_data', bar: 'encrypted_data' };

			entityController.encrypted_attribute_paths = ['bar'];
			entityController.decryptAttributes(subject);

			expect(subject).to.deep.equal({
				id: 'entity_id',
				foo: 'plaintext_data',
				bar: 'sensitive_data'
			});
		});

		it('handles deep attribute paths', () => {
			mockery.registerMock(global.SixCRM.routes.path('lib', 'encryption-utilities.js'), {
				decryptAES256: (iv_key, input) => {
					expect(iv_key).to.equal('entity_id');
					expect(input).to.equal('encrypted_data');
					return 'sensitive_data'
				}
			});

			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { id: 'entity_id', foo: { bar: { baz: 'encrypted_data' } } };

			entityController.encrypted_attribute_paths = ['foo.bar.baz'];
			entityController.decryptAttributes(subject);

			expect(subject).to.deep.equal({ id: 'entity_id', foo: { bar: { baz: 'sensitive_data' } } });
		});
	});

	describe('censorEncryptedAttributes', () => {
		it('replaces encrypted attributes with asterisks', () => {
			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { foo: 'plaintext_data', bar: 'sensitive_data' };

			entityController.encrypted_attribute_paths = ['bar'];
			entityController.censorEncryptedAttributes(subject);

			expect(subject).to.deep.equal({
				foo: 'plaintext_data',
				bar: '****'
			});
		});

		it('handles deep attribute paths', () => {
			const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
			const entityController = new EC('entity');
			const subject = { foo: { bar: { baz: 'sensitive_data' } } };

			entityController.encrypted_attribute_paths = ['foo.bar.baz'];
			entityController.censorEncryptedAttributes(subject);

			expect(subject).to.deep.equal({ foo: { bar: { baz: '****' } } });
		});
	});
});
