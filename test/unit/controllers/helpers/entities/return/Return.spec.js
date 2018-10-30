
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe('/helpers/entities/return/Return.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully calls the constructor', () => {
			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			expect(objectutilities.getClassName(returnHelperController)).to.equal('ReturnHelper');
		});

	});

	describe('assureHistory', () => {

		it('Successfully adds new created_at element when stored entity does not exist or does not have history', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let result = returnHelperController.assureHistory({});
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

			result = returnHelperController.assureHistory({}, null);
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

			result = returnHelperController.assureHistory({}, {history: null});
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

			result = returnHelperController.assureHistory({}, {history:[]});
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

			result = returnHelperController.assureHistory({history:[{created_at: timestamp.getISO8601(), state: 'created'}]}, {history:[]});
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

		});

		it('Fails to add new created_at element when stored entity exists and has history elements', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let stored_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'created'}
				]
			};

			let new_entity = {
				history:[
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			try{
				returnHelperController.assureHistory(new_entity, stored_entity);
				expect(false).to.equal(true);
			}catch(error){
				expect(error.message).to.equal('[500] New event timestamp is less than last observed event.');
			}

		});

		it('Fails to add a first element to the history because the state is not "created"', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let new_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'notcreated'}
				]
			};

			let stored_entity = {
				history:[]
			};

			try{
				returnHelperController.assureHistory(new_entity, stored_entity);
				expect(false).to.equal(true);
			}catch(error){
				expect(error.message).to.equal('[500] The first event in a history must have stated "created", "notcreated" given.');
			}

		});

		it('Preserves history', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let new_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'shipped'}
				]
			};

			let stored_entity = {
				history:[
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			let result = returnHelperController.assureHistory(new_entity, stored_entity);
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(2);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');
			expect(result.history[1]).to.have.property('created_at');
			expect(result.history[1]).to.have.property('state');
			expect(result.history[1].state).to.equal('shipped');

			result = returnHelperController.assureHistory({}, stored_entity);
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(1);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');

		});

		it('Preserves history where history has length greater than 1', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let new_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'shipped'}
				]
			};

			let stored_entity = {
				history:[
					{created_at: timestamp.getLastHourInISO8601(), state: 'notified'},
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			let result = returnHelperController.assureHistory(new_entity, stored_entity);
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(3);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');
			expect(result.history[1]).to.have.property('created_at');
			expect(result.history[1]).to.have.property('state');
			expect(result.history[1].state).to.equal('notified');
			expect(result.history[2]).to.have.property('created_at');
			expect(result.history[2]).to.have.property('state');
			expect(result.history[2].state).to.equal('shipped');
		});

		it('It preserves history when new entity has more than one record', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let new_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'shipped'},
					{created_at: timestamp.getLastHourInISO8601(), state: 'notified'},
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			let stored_entity = {
				history:[
					{created_at: timestamp.getLastHourInISO8601(), state: 'notified'},
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			let result = returnHelperController.assureHistory(new_entity, stored_entity);
			expect(result).to.have.property('history');
			expect(result.history).to.be.a('array');
			expect(result.history.length).to.equal(3);
			expect(result.history[0]).to.have.property('created_at');
			expect(result.history[0]).to.have.property('state');
			expect(result.history[0].state).to.equal('created');
			expect(result.history[1]).to.have.property('created_at');
			expect(result.history[1]).to.have.property('state');
			expect(result.history[1].state).to.equal('notified');
			expect(result.history[2]).to.have.property('created_at');
			expect(result.history[2]).to.have.property('state');
			expect(result.history[2].state).to.equal('shipped');

		});

		it('Fails because more than one new record is provided', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let new_entity = {
				history:[
					{created_at: timestamp.getISO8601(), state: 'accepted'},
					{created_at: timestamp.getISO8601(), state: 'shipped'},
					{created_at: timestamp.getLastHourInISO8601(), state: 'notified'},
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			let stored_entity = {
				history:[
					{created_at: timestamp.getLastHourInISO8601(), state: 'notified'},
					{created_at: timestamp.getPreviousMonthEnd(), state: 'created'}
				]
			};

			try{
				returnHelperController.assureHistory(new_entity, stored_entity);
			}catch(error){
				expect(error.message).to.equal('[500] You may only provide one new history element per request.');
			}

		});

	});

	describe('assurePresenceOfStoredEntityRecords', () => {

		it('succeeds', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let entity = {};
			let stored_entity = {};
			let result = returnHelperController.assurePresenceOfStoredEntityRecords(entity, stored_entity);
			expect(result).to.equal(true);

			entity = MockEntities.getValidReturn();
			stored_entity = {};
			result = returnHelperController.assurePresenceOfStoredEntityRecords(entity, stored_entity);
			expect(result).to.equal(true);


			entity = MockEntities.getValidReturn();
			stored_entity = objectutilities.clone(entity);
			result = returnHelperController.assurePresenceOfStoredEntityRecords(entity, stored_entity);
			expect(result).to.equal(true);

		});

		it('fails (missing product group)', () => {

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			let entity = MockEntities.getValidReturn();
			let stored_entity = MockEntities.getValidReturn();

			try{
				result = returnHelperController.assurePresenceOfStoredEntityRecords(entity, stored_entity);
				expect(false).to.equal(true);
			}catch(error){
				expect(error.message).to.have.string('Missing product group');
			}

		});

	});

	describe('mergeHistories', () => {

		it('succeeds for null case where entity has no history', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Return.js'), class {
				get({id}){
					expect(id).to.be.defined;
					return Promise.resolve(null);
				}
			});

			let entity = MockEntities.getValidReturn();
			delete entity.history;
			delete entity.transactions[0].products[0].history;

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			return returnHelperController.mergeHistories(entity).then(result => {
				expect(entity).to.have.property('history');
				expect(entity.history).to.be.a('array');
				expect(entity.history.length).to.equal(1);
				expect(entity.history[0]).to.have.property('state');
				expect(entity.history[0]).to.have.property('created_at');
				expect(entity.history[0].state).to.equal('created');
				expect(entity.transactions[0].products).to.be.a('array');
				expect(entity.transactions[0].products.length).to.equal(1);
				expect(entity.transactions[0].products[0].history).to.be.a('array');
				expect(entity.transactions[0].products[0].history.length).to.equal(1);
				expect(entity.transactions[0].products[0].history[0]).to.have.property('state');
				expect(entity.transactions[0].products[0].history[0].state).to.equal('created');
				expect(entity.transactions[0].products[0].history[0]).to.have.property('created_at');
			});
		});

		it('succeeds for null case', () => {

			let entity = MockEntities.getValidReturn();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Return.js'), class {
				get({id}){
					expect(id).to.be.defined;
					return Promise.resolve(entity);
				}
			});

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			return returnHelperController.mergeHistories(entity).then(result => {
				expect(entity).deep.equal(result);
			});
		});

		it('succeeds new transactions added to entity', () => {

			let new_stuff = MockEntities.getValidReturn();
			let stored_entity = MockEntities.getValidReturn();
			let entity = objectutilities.clone(stored_entity);
			entity.transactions.push(new_stuff.transactions[0]);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Return.js'), class {
				get({id}){
					expect(id).to.be.defined;
					return Promise.resolve(entity);
				}
			});

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			return returnHelperController.mergeHistories(entity).then(result => {
				expect(entity).deep.equal(result);
			});
		});

		it('successfully adds to the products history', () => {

			let new_stuff = MockEntities.getValidReturn();
			let stored_entity = MockEntities.getValidReturn();
			let entity = objectutilities.clone(stored_entity);
			entity.transactions.push(new_stuff.transactions[0]);
			entity.transactions[0].products[0].history.push({
				state: 'accepted',
				created_at: timestamp.toISO8601((timestamp.createTimestampSeconds() + 1))
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Return.js'), class {
				get({id}){
					expect(id).to.be.defined;
					return Promise.resolve(stored_entity);
				}
			});

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			return returnHelperController.mergeHistories(entity).then(result => {
				expect(entity).deep.equal(result);
			});
		});

		it('fails adds to the products history', () => {

			let new_stuff = MockEntities.getValidReturn();
			let stored_entity = MockEntities.getValidReturn();
			let entity = objectutilities.clone(stored_entity);
			entity.transactions.push(new_stuff.transactions[0]);
			entity.transactions[0].products[0].history.push({
				state: 'accepted',
				created_at: timestamp.toISO8601((timestamp.createTimestampSeconds() + 1))
			});
			entity.transactions[0].products[0].history.push({
				state: 'refunded',
				created_at: timestamp.toISO8601((timestamp.createTimestampSeconds() + 2))
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Return.js'), class {
				get({id}){
					expect(id).to.be.defined;
					return Promise.resolve(stored_entity);
				}
			});

			const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
			let returnHelperController = new ReturnHelperController();

			return returnHelperController.mergeHistories(entity).then(result => {
				expect(false).deep.equal(true);
			}).catch(error => {
				expect(error.message).to.equal('[500] You may only provide one new history element per request.');
			});
		});

	});



	/*
	assurePresenceOfStoredEntityRecords(entity, stored_entity){

    du.debug('Assure Presence of Stored Entity Records');

    if(_.has(stored_entity, 'transactions') && _.isArray(stored_entity.transactions) && arrayutilities.nonEmpty(stored_entity.transactions)){
      arrayutilities.map(stored_entity.transactions, (transaction) => {
        if(_.has(transaction, 'products') && _.isArray(transaction.products) && arrayutilities.nonEmpty(transaction.products)){
          arrayutilities.map(transaction.products, (product_group) => {
            let matching_product_group = this.getMatchingProductGroup(entity, product_group);
            if(_.isNull(matching_product_group)){
              throw eu.getError('server', 'Missing product group: '+product_group.alias);
            }
          });
        }
      });
    }

    return true;

  }
	*/
});
