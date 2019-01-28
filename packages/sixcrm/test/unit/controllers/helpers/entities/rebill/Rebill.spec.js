
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidTransactions() {

	return [getValidTransaction(), getValidTransaction()];

}

function getValidTransaction(id) {

	return MockEntities.getValidTransaction(id)

}

function getValidShippingReceipts() {
	return [getValidShippingReceipt(), getValidShippingReceipt()];
}

function getValidShippingReceipt() {

	return MockEntities.getValidShippingReceipt();

}

function getValidQueueMessageBodyPrototype() {

	return JSON.stringify({
		id: uuidV4()
	});

}

function getValidRebill(id) {

	return MockEntities.getValidRebill(id);

	/*
	  parentsession: uuidV4(),
	  bill_at: '2017-04-06T18:40:41.405Z',
	  amount: 12.22,
	  product_schedules:
	   [ uuidV4(),
	     uuidV4(),
	     uuidV4() ],
	  products:
	   [ { product: uuidV4(),
	       amount: 3.22 },
	     { product: uuidV4(), amount: 9 } ],
	  id: uuidV4(),
	  account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
	  created_at: '2017-11-12T06:03:35.571Z',
	  updated_at: '2017-11-12T06:03:35.571Z',
	  entity_type: 'rebill',
	  state: 'hold',
	  previous_state: 'bill',
	  state_changed_at: '2017-11-12T06:05:35.571Z',
	  history: [
	    {
	      state: 'bill',
	      entered_at: '2017-11-12T06:03:35.571Z',
	      exited_at: '2017-11-12T06:05:35.571Z',
	    },
	    {
	      state: 'hold',
	      entered_at: '2017-11-12T06:05:35.571Z',
	    }
	  ]
	};
	*/

}

function getValidRebillWithNoState(id) {

	let rebill = getValidRebill(id);

	delete rebill.history;
	delete rebill.state;
	delete rebill.previous_state;
	delete rebill.state_changed_at;

	return rebill;

}

function getValidSession(id) {

	return MockEntities.getValidSession(id)

}

function getValidProductSchedule(id) {

	return MockEntities.getValidProductSchedule(id);

}

function getValidProductSchedules(ids) {

	ids = (!_.isUndefined(ids) && !_.isNull(ids)) ? ids : [uuidV4(), uuidV4()];

	return arrayutilities.map(ids, id => getValidProductSchedule(id));

}

function getValidProductScheduleIDs() {

	return arrayutilities.map(getValidProductSchedules(), product_schedule => {
		return product_schedule.id;
	});

}

describe('/helpers/entities/Rebill.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		//mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

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

		mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
			constructor() {}
			pushEvent() {
				return Promise.resolve('some-sns-message-id');
			}
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
			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelper = new RebillHelperController();

			expect(objectutilities.getClassName(rebillHelper)).to.equal('RebillHelper');
		});

	});

	describe('getMostRecentRebill', async () => {

		const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

		it('successfully gets the most recent rebill', async () => {

			const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let session = MockEntities.getValidSession();
			let rebills = MockEntities.getValidRebills();
			rebills = arrayutilities.map(rebills, (rebill, index) => {
				rebill.parentsession = session.id;
				rebill.account = session.account;
				rebill.processing = false;
				if(index == 0){
					rebill.bill_at = timestamp.getISO8601();
				}else{
					rebill.bill_at = timestamp.subtractDays(random.randomInt(1,10));
				}
				return rebill;
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				constructor(){}
				queryBySecondaryIndex({query_parameters, field, index_name, index_value}){
					expect(field).to.equal('parentsession');
					expect(index_name).to.equal('parentsession-index');
					expect(index_value).to.equal(session.id);
					return Promise.resolve({rebills:rebills});
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			let result = await rebillHelperController.getMostRecentRebill({session: session});
			expect(result).to.have.property('id');
			expect(result.parentsession).to.equal(session.id);
			expect(result.account).to.equal(session.account);
			expect(result.id).to.equal(rebills[0].id);

		});

	});

	/*
		async getMostRecentRebill({session, on_or_before = timestamp.getISO8601()}){
			if(!_.has(this, 'rebillController')){
				const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
				this.rebillController = new RebillController();
			}

			const query_parameters = {
				filter_expression = '#bill_atk > :bill_atv AND #processingk != :processingv',
				expression_attribute_names: {
					'#bill_atk': 'bill_at',
					'#processingk': 'processing'
				},
				expression_attribute_values:{
					':bill_atv': on_or_before,
					':processingv': true
				}
			};

			let rebills = await this.sessionController.listByAccount({query_parameters, account: session.account});

		}
		*/

	describe('setParameters', () => {

		it('successfully sets required parameters', () => {

			//required
			let rebill = getValidRebill();

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelper = new RebillHelperController();

			return rebillHelper.setParameters({
				argumentation: {
					rebill: rebill
				},
				action: 'getShippingReceipts'
			}).then(() => {

				return expect(rebillHelper.parameters.store['rebill']).to.equal(rebill);

			});

		});

		xit('successfully sets optional parameters', () => {

			//required
			let session = getValidSession();

			let day = 2;

			let product_schedules = getValidProductScheduleIDs();

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelper = new RebillHelperController();

			return rebillHelper.setParameters({
				argumentation: {
					session: session,
					day: day,
					product_schedules: product_schedules
				},
				action: 'createRebill'
			}).then(() => {

				expect(rebillHelper.parameters.store['session']).to.equal(session);
				expect(rebillHelper.parameters.store['day']).to.equal(day);
				return expect(rebillHelper.parameters.store['productscheduleids']).to.equal(product_schedules);

			});

		});

		it('successfully sets optional parameters for "updateRebillState" action', () => {

			let rebill = getValidRebill();

			let new_state = 'shipped';

			let previous_state = 'pending';

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelper = new RebillHelperController();

			return rebillHelper.setParameters({
				argumentation: {
					//required parameters
					rebill: rebill,
					new_state: new_state,
					//optional parameter
					previous_state: 'pending'
				},
				action: 'updateRebillState'
			}).then(() => {

				expect(rebillHelper.parameters.store['rebill']).to.equal(rebill);
				expect(rebillHelper.parameters.store['newstate']).to.equal(new_state);
				return expect(rebillHelper.parameters.store['previousstate']).to.equal(previous_state);

			});

		});

	});

	describe('updateRebillState', () => {

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

		it('throws an error when new state is not defined', () => {
			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update() {
					expect.fail();
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelperController();
			const rebill = {
				id: 'SOME_REBILL_ID',
				some_other_field: 'SOME_OTHER_FIELD'
			};

			return rebillHelper.updateRebillState({
				rebill: rebill,
				previous_state: 'bill'
			})
				.catch((error) => expect(error.message).to.have.string('[500] Missing source object field: "new_state".'))
		});

		it('throws an error when updating to unknown state', () => {
			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelper();
			const rebill = getValidRebill();

			return rebillHelper.updateRebillState({
				rebill: rebill,
				new_state: 'unknown'
			})
				.then(() => expect.fail('Error not thrown'))
				.catch((error) => expect(error.message).to.have.string('[500] One or more validation errors occurred'))
		});

		it('updates rebill state when when rebill has no state (initial state)', () => {
			const rebill = getValidRebillWithNoState();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelper();

			return rebillHelper.updateRebillState({
				rebill: rebill,
				new_state: 'hold'
			})
				.then((rebill) => {
					expect(rebill.previous_state).to.equal(undefined);
					expect(rebill.state).to.equal('hold');
					expect(rebill.history.length).to.equal(1);
					expect(rebill.history[0].state).to.equal('hold');
					expect(rebill.history[0].entered_at).to.equal(rebill.state_changed_at);
					return expect(rebill.history[0].exited_at).to.equal(undefined);
				})
		});

		it('updates previous state when when rebill state', () => {
			const rebill = getValidRebillWithNoState();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelper();

			rebill.state = 'hold';
			rebill.state_changed_at = '2017-11-12T06:03:35.571Z';
			rebill.history = [{
				state: 'hold',
				entered_at: '2017-11-12T06:03:35.571Z'
			}];

			return rebillHelper.updateRebillState({
				rebill: rebill,
				new_state: 'shipped'
			})
				.then((rebill) => {
					expect(rebill.previous_state).to.equal('hold');
					expect(rebill.state).to.equal('shipped');
					expect(rebill.history.length).to.equal(2);
					expect(rebill.history[0].state).to.equal('hold');
					expect(rebill.history[0].exited_at).to.equal(rebill.state_changed_at);
					expect(rebill.history[1].state).to.equal('shipped');
					expect(rebill.history[1].entered_at).to.equal(rebill.state_changed_at);
					return expect(rebill.history[1].exited_at).to.equal(undefined);
				})
		});

		it('updates rebill state and history when rebill has history', () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelper();

			rebill.state = 'hold';
			rebill.previous_state = 'bill';
			rebill.state_changed_at = '2017-11-12T06:03:35.571Z';
			rebill.history = [{
				state: 'bill',
				entered_at: '2017-11-12T06:03:35.571Z'
			}];

			return rebillHelper.updateRebillState({
				rebill: rebill,
				new_state: 'hold',
				previous_state: 'bill',
				error_message: 'errorMessage'
			})
				.then((rebill) => {
					expect(rebill.previous_state).to.equal('bill');
					expect(rebill.state).to.equal('hold');
					expect(rebill.history.length).to.equal(2);
					expect(rebill.history[0].state).to.equal('bill');
					expect(rebill.history[0].entered_at).to.equal('2017-11-12T06:03:35.571Z');
					expect(rebill.history[0].exited_at).to.equal(rebill.state_changed_at);
					expect(rebill.history[1].state).to.equal('hold');
					expect(rebill.history[1].entered_at).to.equal(rebill.state_changed_at);
					expect(rebill.history[1].exited_at).to.equal(undefined);
					return expect(rebill.history[1].error_message).to.equal('errorMessage');
				})
		});

		it('updates rebill state and history when rebill has more items in history', () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			const rebillHelper = new RebillHelper();

			rebill.state = 'bill';
			rebill.previous_state = 'hold';
			rebill.state_changed_at = '2017-11-12T07:03:35.571Z';
			rebill.history = [{
				state: 'hold',
				entered_at: '2017-11-12T06:03:35.571Z',
				exited_at: '2017-11-12T07:03:35.571Z'
			},
			{
				state: 'bill',
				entered_at: '2017-11-12T07:03:35.571Z'
			}
			];

			return rebillHelper.updateRebillState({
				rebill: rebill,
				new_state: 'pending',
				previous_state: 'bill',
				error_message: 'errorMessage'
			})
				.then((rebill) => {
					expect(rebill.previous_state).to.equal('bill');
					expect(rebill.state).to.equal('pending');
					expect(rebill.history.length).to.equal(3);

					expect(rebill.history[0].state).to.equal('hold');
					expect(rebill.history[0].entered_at).to.equal('2017-11-12T06:03:35.571Z');
					expect(rebill.history[0].exited_at).to.equal('2017-11-12T07:03:35.571Z');

					expect(rebill.history[1].state).to.equal('bill');
					expect(rebill.history[1].entered_at).to.equal('2017-11-12T07:03:35.571Z');
					expect(rebill.history[1].exited_at).to.equal(rebill.state_changed_at);

					expect(rebill.history[2].state).to.equal('pending');
					expect(rebill.history[2].entered_at).to.equal(rebill.state_changed_at);
					expect(rebill.history[2].exited_at).to.equal(undefined);
					return expect(rebill.history[2].error_message).to.equal('errorMessage');
				})
		});
	});

	describe('addRebillToQueue', () => {

		it('successfully adds a rebill message to a specified queue', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.addRebillToQueue({
				rebill: rebill,
				queue_name: 'hold'
			}).then(result => {
				return expect(result).to.equal(true);
			});

		});

	});

	describe('addQueueMessageToQueue', () => {
		it('successfully adds a message to a queue', () => {

			let queue_name = 'hold';
			let queue_message_body_prototype = getValidQueueMessageBodyPrototype();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				sendMessage() {
					return Promise.resolve(true);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('queuename', queue_name);
			rebillHelperController.parameters.set('queuemessagebodyprototype', queue_message_body_prototype);

			return rebillHelperController.addQueueMessageToQueue().then(result => {
				return expect(result).to.equal(true);
			});

		});
	});

	describe('createQueueMessageBodyPrototype', () => {

		it('successfully creates a queue message body prototype from a rebill', () => {

			let rebill = getValidRebill();

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			let result = rebillHelperController.createQueueMessageBodyPrototype();

			expect(result).to.equal(true);
			expect(rebillHelperController.parameters.store['queuemessagebodyprototype']).to.be.defined;

			let parsed_queue_message_body_prototype = JSON.parse(rebillHelperController.parameters.store['queuemessagebodyprototype']);

			expect(parsed_queue_message_body_prototype).to.deep.equal({
				id: rebill.id
			});

		});

	});

	describe('getShippingReceipts', () => {

		it('successfully retrieves shipping receipts associated with a rebill', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			arrayutilities.map(shipping_receipt_ids, (shipping_receipt_id, index) => {
				transactions[0].products[index].shipping_receipt = shipping_receipt_id;
			})

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: transactions
					});
				}
				get() {
					return Promise.resolve(rebill);
				}
				getResult(result, field) {
					if (_.isUndefined(field)) {
						field = 'rebills';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				batchGet() {
					return Promise.resolve(shipping_receipts);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getShippingReceipts({
				rebill: rebill
			}).then(result => {
				return expect(result).to.deep.equal(shipping_receipts);
			});

		});

		it('successfully returns a empty array', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();

			//delete transactions[0].products[0].shipping_receipt;
			//delete transactions[1].products[0].shipping_receipt;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: transactions
					});
				}
				get() {
					return Promise.resolve(rebill);
				}
				getResult(result, field) {
					if (_.isUndefined(field)) {
						field = 'rebills';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				batchGet() {
					return Promise.resolve(null);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getShippingReceipts({
				rebill: rebill
			}).then(result => {
				return expect(result).to.deep.equal([]);
			});

		});

	});

	describe('acquireTransactions', () => {

		it('successfully retrieves transactions associated with a rebill', () => {

			let rebill = getValidRebill();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: transactions
					});
				}
				getResult(result, field) {
					if (_.isUndefined(field)) {
						field = 'rebills';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.acquireTransactions().then(result => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['transactions']).to.deep.equal(transactions);
			});

		});

		it('successfully handles the no-transactions case', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({
						transactions: null
					});
				}
				getResult(result, field) {
					if (_.isUndefined(field)) {
						field = 'rebills';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.acquireTransactions().then(result => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['transactions']).to.not.be.defined;
			});

		});

	});

	describe('getShippingReceiptIDs', () => {

		it('successfully parses shipping receipts ids from a transaction', () => {

			let transactions = getValidTransactions();
			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			arrayutilities.map(shipping_receipts, (shipping_receipt, index) => {
				transactions[0].products[index].shipping_receipt = shipping_receipt.id;
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('transactions', transactions);

			let result = rebillHelperController.getShippingReceiptIDs();

			expect(result).to.equal(true);
			expect(rebillHelperController.parameters.store['shippingreceiptids']).to.deep.equal(shipping_receipt_ids);

		});

		it('successfully handles no transactions case', () => {

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			let result = rebillHelperController.getShippingReceiptIDs();

			expect(result).to.equal(true);
			expect(rebillHelperController.parameters.store['shippingreceiptids']).to.not.be.defined;

		});

	});

	describe('acquireShippingReceipts', () => {

		it('successfully acquires shipping receipts given a list of shipping receipt IDs', () => {

			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				batchGet() {
					return Promise.resolve(shipping_receipts);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

			return rebillHelperController.acquireShippingReceipts().then(result => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
			});

		});

		it('successfully acquires shipping receipts given a list of shipping receipt IDs', () => {

			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class {
				batchGet() {
					return Promise.resolve(shipping_receipts);
				}
			});

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

			return rebillHelperController.acquireShippingReceipts().then(result => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['shippingreceipts']).to.not.be.defined;
			});

		});

		it('successfully acquires shipping receipts when shipping receipt controller is already set', () => {

			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');

			let shipping_receipts = getValidShippingReceipts();
			let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.shippingReceiptController = new ShippingReceiptController();
			rebillHelperController.shippingReceiptController.batchGet = () => {
				return Promise.resolve(shipping_receipts);
			};

			rebillHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

			return rebillHelperController.acquireShippingReceipts().then(result => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
			});

		});

	});

	describe('getBillableRebills', () => {

		const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

		it('successfully retrieves billable rebills', () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getRebillsAfterTimestamp(stamp) {
					expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

					return Promise.resolve([rebill]);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getBillableRebills().then(result => {
				const rebills = rebillHelperController.parameters.get('billablerebills');

				expect(result).to.equal(true);
				expect(rebills.length).to.equal(1);
				return expect(rebills[0]).to.deep.equal(rebill)
			});

		});

		it('filters out rebills in process', () => {
			const rebill = getValidRebill();

			rebill.processing = true;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getRebillsAfterTimestamp(stamp) {
					expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

					return Promise.resolve([rebill]);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getBillableRebills().then(result => {
				const rebills = rebillHelperController.parameters.get('billablerebills');

				expect(result).to.equal(true);
				return expect(rebills.length).to.equal(0);
			});

		});

		it('filters out upsold rebills', () => {
			const rebill = getValidRebill();

			rebill.upsell = uuidV4();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getRebillsAfterTimestamp(stamp) {
					expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

					return Promise.resolve([rebill]);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getBillableRebills().then(result => {
				const rebills = rebillHelperController.parameters.get('billablerebills');

				expect(result).to.equal(true);
				return expect(rebills.length).to.equal(0);
			});

		});

		it('successfully retrieves billable rebills when rebill controller is already set', () => {

			let rebill = getValidRebill();
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.rebillController = new RebillController();
			rebillHelperController.rebillController.getRebillsAfterTimestamp = (stamp) => {
				expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

				return Promise.resolve([rebill]);
			};

			return rebillHelperController.getBillableRebills().then((result) => {
				let billable_rebills = rebillHelperController.parameters.get('billablerebills');

				expect(result).to.equal(true);
				expect(billable_rebills.length).to.equal(1);
				return expect(billable_rebills[0]).to.deep.equal(rebill)
			});

		});

	});

	describe('setRebillProcessing', () => {

		it('successfully sets rebill processing', () => {

			let rebill = getValidRebill();

			let processing = true;

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('processing', processing);

			expect(rebillHelperController.setRebillProcessing()).to.equal(true);
			expect(rebillHelperController.parameters.store['rebill'].processing).to.equal(processing);
		});
	});

	describe('assureProductScheduleHelperController', () => {

		it('returns true when product schedule controller is assured', () => {

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			expect(rebillHelperController.assureProductScheduleHelperController()).to.equal(true);
			expect(rebillHelperController.productScheduleHelperController).to.be.defined;
		});

		it('returns true when product schedule controller is already set', () => {

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.productScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');

			expect(rebillHelperController.assureProductScheduleHelperController()).to.equal(true);
		});
	});

	describe('isAvailable', () => {

		it('returns true when rebill is available for billing', () => {

			let rebill = getValidRebill();

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			expect(rebillHelperController.isAvailable({
				rebill: rebill
			})).to.equal(true);
		});

		it('returns false when rebill is not available for billing', () => {

			let rebill = getValidRebill();

			//rebill is not billable if "bill_at" is in the future
			rebill.bill_at = "3018-02-02T18:40:41.405Z";

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			expect(rebillHelperController.isAvailable({
				rebill: rebill
			})).to.equal(false);
		});
	});

	describe('createRebillMessageSpoof', () => {

		it('successfully creates rebill message spoof', () => {

			let rebill = getValidRebill();

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			let spoofed_message = rebillHelperController.createRebillMessageSpoof(rebill);

			expect(spoofed_message.spoofed).to.equal(true);
			expect(spoofed_message.MD5OfBody).to.equal('');
			expect(spoofed_message.ReceiptHandle).to.equal('');
			expect(spoofed_message.Body).to.equal('{"id":"' + rebill.id + '"}');
			expect(stringutilities.isUUID(spoofed_message.MessageId)).to.equal(true);
		});
	});

	describe('spoofRebillMessages', () => {

		it('successfully spoofs rebill messages', () => {

			let billable_rebills = [
				getValidRebill(),
				getValidRebill(),
				getValidRebill()
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('billablerebills', billable_rebills);

			expect(rebillHelperController.spoofRebillMessages()).to.equal(true);

			let spoofed_rebill_messages = rebillHelperController.parameters.get('spoofedrebillmessages');

			spoofed_rebill_messages.forEach((spoofed_message, index) => {
				expect(spoofed_message.spoofed).to.equal(true);
				expect(spoofed_message.MD5OfBody).to.equal('');
				expect(spoofed_message.ReceiptHandle).to.equal('');
				expect(spoofed_message.Body).to.equal('{"id":"' + billable_rebills[index].id + '"}');
				expect(stringutilities.isUUID(spoofed_message.MessageId)).to.equal(true);
			});
		});

		it('returns true when there are no billable rebills', () => {

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('billablerebills', []);

			expect(rebillHelperController.spoofRebillMessages()).to.equal(true);
			expect(rebillHelperController.parameters.store['spoofedrebillmessages']).to.deep.equal([]);
		});
	});

	describe('getAvailableRebillsAsMessages', () => {

		const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

		it('successfully retrieves spoofed messages of billable rebills', () => {

			let rebills = [
				getValidRebill()
			];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getRebillsAfterTimestamp(stamp) {
					expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);
					return Promise.resolve(rebills);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.getAvailableRebillsAsMessages().then((spoofed_message) => {
				expect(spoofed_message[0].spoofed).to.equal(true);
				expect(spoofed_message[0].MD5OfBody).to.equal('');
				expect(spoofed_message[0].ReceiptHandle).to.equal('');
				expect(spoofed_message[0].Body).to.equal('{"id":"' + rebills[0].id + '"}');
				return expect(stringutilities.isUUID(spoofed_message[0].MessageId)).to.equal(true);
			});
		});
	});

	describe('setConditionalProperties', () => {

		it('returns true when rebill does not have a new state', () => {

			let rebill = getValidRebill();

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			expect(rebillHelperController.setConditionalProperties()).to.equal(true);
		});

		it('successfully sets previous rebill state', () => {

			let rebill = getValidRebill();

			let new_state = 'shipped'; //any valid rebill state

			rebill.state = 'pending'; //any valid rebill state

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('newstate', new_state);

			expect(rebillHelperController.setConditionalProperties()).to.equal(true);
			expect(rebillHelperController.parameters.store['previousstate']).to.equal(rebill.state);
		});

		it('returns true when previous state is already set', () => {

			let rebill = getValidRebill();

			let new_state = 'shipped'; //any valid rebill state

			rebill.state = 'pending'; //any valid rebill state

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('newstate', new_state);
			rebillHelperController.parameters.set('previousstate', rebill.state);

			expect(rebillHelperController.setConditionalProperties()).to.equal(true);
		});
	});

	describe('updateRebill', () => {

		it('successfully updates rebill', () => {

			let rebill = getValidRebill();

			let updated_rebill = objectutilities.clone(rebill);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					expect(entity).to.equal(rebill);
					return Promise.resolve(updated_rebill);
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.updateRebill().then((result) => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['rebill']).to.equal(updated_rebill);
			});
		});

		it('successfully updates rebill when rebill controller is already set', () => {

			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

			let rebill = getValidRebill();

			let updated_rebill = objectutilities.clone(rebill);

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.rebillController = new RebillController();
			rebillHelperController.rebillController.update = ({
				entity
			}) => {
				expect(entity).to.equal(rebill);
				return Promise.resolve(updated_rebill);
			};
			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.updateRebill().then((result) => {
				expect(result).to.equal(true);
				return expect(rebillHelperController.parameters.store['rebill']).to.equal(updated_rebill);
			});
		});
	});

	describe('createUpdatedHistoryObjectPrototype', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('adds history object with new state to rebill', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			let state_changed_at = timestamp.getLastHourInISO8601();

			let new_state = 'shipped';

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getThisHourInISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', rebill.history[1].state);
			rebillHelperController.parameters.set('newstate', new_state);
			rebillHelperController.parameters.set('statechangedat', state_changed_at);

			let result = rebillHelperController.createUpdatedHistoryObjectPrototype();

			expect(result[1].exited_at).to.equal(state_changed_at);
			expect(result[2].state).to.equal(new_state);
			expect(result[2].entered_at).to.equal(state_changed_at);
		});

		it('adds history object with new state when rebill has no previous history', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			let state_changed_at = timestamp.getLastHourInISO8601();

			let new_state = 'shipped';

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('newstate', new_state);
			rebillHelperController.parameters.set('statechangedat', state_changed_at);

			let result = rebillHelperController.createUpdatedHistoryObjectPrototype();

			expect(result[0]).to.deep.equal({
				state: new_state,
				entered_at: state_changed_at
			});
		});
	});

	describe('createHistoryElementPrototype', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully creates history element', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let params = {
				state: 'pending',
				entered_at: timestamp.getISO8601(),
				exited_at: timestamp.getISO8601()
			};

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			expect(rebillHelperController.createHistoryElementPrototype(params)).to.deep.equal({
				entered_at: params.entered_at,
				exited_at: params.exited_at,
				state: params.state
			});
		});

		it('successfully creates history element when parameters are not specified', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let params = {
				state: 'pending',
				entered_at: timestamp.getISO8601(),
				exited_at: null
			};

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('newstate', params.state);
			rebillHelperController.parameters.set('statechangedat', params.entered_at);
			rebillHelperController.parameters.set('exitedat', params.exited_at);

			expect(rebillHelperController.createHistoryElementPrototype({})).to.deep.equal({
				entered_at: params.entered_at,
				state: params.state
			});
		});

		it('sets history element with an error message', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let params = {
				state: '',
				entered_at: timestamp.getISO8601(),
				exited_at: timestamp.getISO8601(),
				error_message: 'Rebill had no previous history of being in this state.'
			};

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			expect(rebillHelperController.createHistoryElementPrototype(params)).to.deep.equal(params);
		});
	});

	describe('getLastMatchingStatePrototype', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('gets matching state when there is only one corresponding previous state', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();
			const now = timestamp.getISO8601();

			rebill.history = [{
				state: 'hold',
				entered_at: now
			},
			{
				state: 'pending',
				entered_at: now
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', 'pending');
			rebillHelperController.parameters.set('statechangedat', now);

			expect(rebillHelperController.getLastMatchingStatePrototype()).to.deep.equal(rebill.history[1]);
		});

		it('gets last matching state when there are more than one specified previous state', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getThisHourInISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getLastHourInISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', 'pending');
			rebillHelperController.parameters.set('statechangedat', timestamp.getISO8601());

			expect(rebillHelperController.getLastMatchingStatePrototype()).to.deep.equal(rebill.history[3]);
		});

		it('gets last matching state when rebill does not have a history of specified previous state', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();
			let previous_state = 'pending';
			let state_changed_at = timestamp.getISO8601();
			let exited_at = timestamp.getISO8601();
			let error_message = 'Rebill had no previous history of being in this state.';

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getISO8601()
			},
			{
				state: 'shipped',
				entered_at: timestamp.getISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', previous_state);
			rebillHelperController.parameters.set('statechangedat', state_changed_at);
			rebillHelperController.parameters.set('exitedat', exited_at);

			expect(rebillHelperController.getLastMatchingStatePrototype()).to.deep.equal({
				state: previous_state,
				entered_at: state_changed_at,
				exited_at: exited_at,
				error_message: error_message
			});
		});
	});

	describe('updateHistoryPreviousStateWithNewExit', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('updates previous state from history with new exit', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			let state_changed_at = timestamp.getISO8601();

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getThisHourInISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getLastHourInISO8601()
			},
			{
				state: 'shipped',
				entered_at: timestamp.getISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', 'pending');
			rebillHelperController.parameters.set('statechangedat', state_changed_at);

			let result = rebillHelperController.updateHistoryPreviousStateWithNewExit();

			expect(result[3].state).to.deep.equal(rebill.history[3].state);
			expect(result[3].entered_at).to.deep.equal(rebill.history[3].entered_at);
			//update only matching state
			expect(result[3].exited_at).to.deep.equal(state_changed_at);
			//leave others unaltered
			expect(result[0].exited_at).to.be.undefined;
			expect(result[1].exited_at).to.be.undefined;
			expect(result[2].exited_at).to.be.undefined;
			expect(result[4].exited_at).to.be.undefined;
		});
	});

	describe('buildUpdatedRebillPrototype', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully builds updated rebill prototype', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			let new_state = 'shipped';

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getThisHourInISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', rebill.history[1].state);
			rebillHelperController.parameters.set('newstate', new_state);

			expect(rebillHelperController.buildUpdatedRebillPrototype()).to.equal(true);

			let updated_rebill_prototype = rebillHelperController.parameters.get('updatedrebillprototype');

			let state_changed_at = rebillHelperController.parameters.get('statechangedat');

			expect(updated_rebill_prototype.state).to.equal(new_state);
			expect(updated_rebill_prototype.state_changed_at).to.equal(state_changed_at);
			expect(updated_rebill_prototype.previous_state).to.equal(rebill.history[1].state);
			expect(updated_rebill_prototype.history[2].entered_at).to.equal(state_changed_at);
			expect(updated_rebill_prototype.history[2].state).to.equal(new_state);
		});

		it('successfully builds updated rebill prototype', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			let new_state = 'shipped';

			rebill.history = [{
				state: 'hold',
				entered_at: timestamp.getThisHourInISO8601()
			},
			{
				state: 'pending',
				entered_at: timestamp.getISO8601()
			}
			];

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);
			rebillHelperController.parameters.set('previousstate', rebill.history[1].state);
			rebillHelperController.parameters.set('newstate', new_state);
			rebillHelperController.parameters.unset('previousstate');

			try {
				rebillHelperController.buildUpdatedRebillPrototype()
			} catch (error) {
				expect(error.message).to.equal('[500] "previousstate" property is not set.');
			}
		});
	});

	describe('updateRebillFromUpdatedRebillPrototype', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock('@6crm/sixcrmcore/lib/util/timestamp', {
				default: class {
					static getThisHourInISO8601() {
						return '2018-07-10T06:00:00Z';
					}
					static getLastHourInISO8601() {
						return '2018-07-10T05:00:00Z';
					}
					static getISO8601() {
						return '2018-07-10T06:49:13Z';
					}
				}
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully updates rebill from updated rebill prototype', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();

			rebill.state = 'shipped';
			rebill.state_changed_at = timestamp.getISO8601();
			rebill.history = [{
				state: 'pending',
				entered_at: timestamp.getISO8601(),
				exited_at: rebill.state_changed_at
			},
			{
				entered_at: rebill.state_changed_at,
				state: rebill.state
			}
			];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					expect(entity).to.equal(rebill);
					return Promise.resolve(entity);
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('updatedrebillprototype', rebill);

			return rebillHelperController.updateRebillFromUpdatedRebillPrototype().then((result) => {
				return expect(result).to.deep.equal(rebill);
			});
		});

		it('successfully updates rebill from updated rebill prototype when rebill controller is already set', () => {

			const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

			let rebill = getValidRebill();
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

			rebill.state = 'shipped';
			rebill.state_changed_at = timestamp.getISO8601();
			rebill.history = [{
				state: 'pending',
				entered_at: timestamp.getISO8601(),
				exited_at: rebill.state_changed_at
			},
			{
				entered_at: rebill.state_changed_at,
				state: rebill.state
			}
			];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({
					entity
				}) {
					expect(entity).to.equal(rebill);
					return Promise.resolve(rebill);
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.rebillController = new RebillController();
			rebillHelperController.rebillController.update = ({
				entity
			}) => {
				expect(entity).to.equal(rebill);
				return Promise.resolve(rebill);
			};

			rebillHelperController.parameters.set('updatedrebillprototype', rebill);

			return rebillHelperController.updateRebillFromUpdatedRebillPrototype().then((result) => {
				return expect(result).to.deep.equal(rebill);
			});
		});
	});

	describe('acquireRebill', () => {

		it('successfully acquires rebill', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get({
					id
				}) {
					expect(id).to.equal(rebill.id);
					return Promise.resolve(rebill);
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.acquireRebill().then((result) => {
				return expect(result).to.equal(true);
			});
		});

		it('successfully acquires rebill when rebill controller is already set', () => {

			let rebill = getValidRebill();
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			rebillHelperController.rebillController = new RebillController();
			rebillHelperController.rebillController.get = ({
				id
			}) => {
				expect(id).to.equal(rebill.id);
				return Promise.resolve(rebill);
			};

			rebillHelperController.parameters.set('rebill', rebill);

			return rebillHelperController.acquireRebill().then((result) => {
				return expect(result).to.equal(true);
			});
		});
	});

	describe('updateRebillProcessing', () => {

		it('successfully updates rebill processing', () => {

			let rebill = getValidRebill();

			let processing = true;

			let updated_rebill = objectutilities.clone(rebill);

			updated_rebill.processing = processing;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get({
					id
				}) {
					expect(id).to.equal(rebill.id);
					return Promise.resolve(rebill);
				}
				update({
					entity
				}) {
					expect(entity).to.equal(rebill);
					return Promise.resolve(updated_rebill);
				}
			});

			let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			return rebillHelperController.updateRebillProcessing({
				rebill: rebill,
				processing: processing
			}).then((result) => {
				expect(rebillHelperController.parameters.store['rebill']).to.deep.equal(updated_rebill);
				expect(rebillHelperController.parameters.store['rebill'].processing).to.equal(processing);
				expect(rebillHelperController.parameters.store['processing']).to.equal(processing);
				return expect(result).to.equal(true);
			});
		});
	});

	describe('getYearMonth', () => {
		it('returns the year and the month of the timestamp', () => {

			const scenarios = [
				{
					timestamp: "2017-04-06T18:40:41.405Z",
					result:"201704"
				},
				{
					timestamp: "2018-12-06T18:40:41.405Z",
					result:"201812"
				}
			];

			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			let rebillHelperController = new RebillHelperController();

			arrayutilities.map(scenarios, scenario => {
				expect(rebillHelperController.getYearMonth(scenario.timestamp)).to.equal(scenario.result);
			});

		});
	});

});
