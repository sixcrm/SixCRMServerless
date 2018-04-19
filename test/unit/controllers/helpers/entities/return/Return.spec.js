
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
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

	beforeEach(() => {});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
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
