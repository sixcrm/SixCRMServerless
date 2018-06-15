
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const uuidV4 = require('uuid/v4');
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

function getValidAbridgedEntity(){

	return {
		id: uuidV4(),
		index_action: 'add',
		entity_type:'product'
	};

}

function getValidPackagedAbridgedEntity(){

	return JSON.stringify(getValidAbridgedEntity());

}

describe('controllers/helpers/indexing/PreIndexing.js', () => {

	before(() => {
		mockery.resetCache();
		mockery.deregisterAll();

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {
			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			expect(objectutilities.getClassName(preIndexingHelperController)).to.equal('PreIndexingHelperController');
		});

	});

	describe('pushToIndexingBucket', () => {

		it('successfully pushes a abridged entity to the search indexing bucket', () => {

			let packaged_abridged_entity = getValidPackagedAbridgedEntity();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('packagedabridgedentity', packaged_abridged_entity);
			return preIndexingHelperController.pushToIndexingBucket().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

	describe('packageEntity', () => {

		it('successfully packages entity', () => {

			let abridged_entity = getValidAbridgedEntity();

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('abridgedentity', abridged_entity);

			return preIndexingHelperController.packageEntity().then(result => {
				expect(result).to.equal(true);
				expect(preIndexingHelperController.parameters.store['packagedabridgedentity']).to.be.defined;
				expect(JSON.parse(preIndexingHelperController.parameters.store['packagedabridgedentity'])).to.deep.equal(abridged_entity);
			});
		});

	});

	describe('abridgeEntity', () => {

		it('successfully abridges an entity', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('preindexingentity', preindexing_entity);

			return preIndexingHelperController.abridgeEntity().then(result => {
				expect(result).to.equal(true);
				expect(preIndexingHelperController.parameters.store['abridgedentity']).to.be.defined;
				expect(preIndexingHelperController.parameters.store['abridgedentity']).to.deep.equal(abridged_entity);
			});
		});

	});

	describe('validateEntityForIndexing', () => {

		it('successfully validates a entity for indexing', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('preindexingentity', preindexing_entity);

			return preIndexingHelperController.validateEntityForIndexing().then(result => {
				expect(result).to.equal(true);
			});
		});

		it('successfully rejects a non-indexed entity', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			preindexing_entity.entity_type = 'x';

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('preindexingentity', preindexing_entity);

			return preIndexingHelperController.validateEntityForIndexing()
				.then(() => {
					expect(true).to.equal(false);
				})
				.catch(result => {
					expect(result).to.equal(true);
				});

		});

	});

	describe('executePreIndexing', () => {

		it('successfully executes preindexing', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('preindexingentity', preindexing_entity);

			return preIndexingHelperController.executePreIndexing()
				.then(() => {
					expect(true).to.equal(true);
				});

		});

		it('successfully executes preindexing without action', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			preindexing_entity.entity_type = 'x';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					expect(true).to.equal(false);
				}
			});

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.parameters.set('preindexingentity', preindexing_entity);

			return preIndexingHelperController.executePreIndexing()
				.then(() => {
					expect(true).to.equal(true);
				});

		});
	});

	describe('addToSearchIndex', () => {

		it('successfully adds a entity to the search index (add)', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			delete preindexing_entity.index_action;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			return preIndexingHelperController.addToSearchIndex(preindexing_entity).then(result => {
				expect(result).to.equal(true);
				let processed_preindexing_entity = preIndexingHelperController.parameters.store['preindexingentity'];

				expect(processed_preindexing_entity.index_action).to.equal('add');
			});

		});

	});

	describe('removeFromSearchIndex', () => {

		it('successfully adds a entity to the search index (delete)', () => {

			let abridged_entity = getValidAbridgedEntity();
			let random_fields = {abc:"123", isnt:{this:'hierarchicalstructuregreat'}, 'somethingelse':'isjustthat'};
			let preindexing_entity = objectutilities.merge(abridged_entity, random_fields);

			delete preindexing_entity.index_action;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			return preIndexingHelperController.removeFromSearchIndex(preindexing_entity).then(result => {
				expect(result).to.equal(true);
				let processed_preindexing_entity = preIndexingHelperController.parameters.store['preindexingentity'];

				expect(processed_preindexing_entity.index_action).to.equal('delete');
			});

		});

	});


	describe('setAbridgedEntityMap', () => {

		it('successfully sets abridged entity map property', () => {

			let keys = objectutilities.getKeys(global.SixCRM.routes.include('model','helpers/indexing/indexelement.json').properties);

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.setAbridgedEntityMap();

			expect(preIndexingHelperController).to.have.property('abridged_entity_map');
			expect(objectutilities.getKeys(preIndexingHelperController.abridged_entity_map)).to.deep.equal(keys);
			expect(objectutilities.getValues(preIndexingHelperController.abridged_entity_map)).to.deep.equal(keys);

		});

	});

	describe('setIndexingEntities', () => {

		it('successfully sets indexing entities property', () => {

			let keys = global.SixCRM.routes.include('model', 'helpers/indexing/entitytype.json').enum;

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			preIndexingHelperController.setIndexingEntities();

			expect(preIndexingHelperController).to.have.property('indexing_entities');
			expect(preIndexingHelperController.indexing_entities).to.deep.equal(keys);

		});

	});

	describe('initialize', () => {

		it('successfully initializes properties', () => {

			const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
			let preIndexingHelperController = new PreIndexingHelperController();

			delete preIndexingHelperController.parameters;
			delete preIndexingHelperController.indexing_entities;
			delete preIndexingHelperController.abridged_entity_map;
			delete preIndexingHelperController.sqsprovider;
			preIndexingHelperController.initialize();

			expect(preIndexingHelperController).to.have.property('indexing_entities');
			expect(preIndexingHelperController).to.have.property('abridged_entity_map');
			expect(preIndexingHelperController).to.have.property('parameters');
			expect(preIndexingHelperController).to.have.property('sqsprovider');

		});

	});

});
