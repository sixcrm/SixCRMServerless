let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
//const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidRebill() {
	return MockEntities.getValidRebill()
}

describe('controllers/Rebill.js', () => {

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

	describe('listTransactions', () => {

		it('lists transactions by rebill', () => {
			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), class {
				listTransactionsByRebillID({id}) {
					expect(id).to.equal(rebill.id);
					return Promise.resolve(['a_transaction']);
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listTransactions(rebill).then((result) => {
				expect(result).to.deep.equal(['a_transaction']);
			});
		});
	});

	describe('getParentSession', () => {

		it('successfully retrieves parent session', () => {
			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Session.js'), class {
				get({id}) {
					expect(id).to.equal(rebill.parentsession);
					return Promise.resolve('a_parent_session');
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.getParentSession(rebill).then((result) => {
				expect(result).to.equal('a_parent_session');
			});
		});

		it('returns null when rebill does not have a parent session', () => {
			let rebill = getValidRebill();

			delete rebill.parentsession;

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			expect(rebillController.getParentSession(rebill)).to.equal(null);
		});
	});

	describe('listBySession', () => {

		it('lists rebills by session', () => {
			let rebill = getValidRebill();

			let params = {
				session: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('parentsession-index');
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal(params.session.id);
					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listBySession(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					rebills: [rebill]
				});
			});
		});
	});

	describe('listByState', () => {

		it('lists rebills by state', () => {
			let rebill = getValidRebill();

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_values[':statev']).to.equal('a_state');
					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listByState({state: 'a_state', pagination: 0}).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					rebills: [rebill]
				});
			});
		});

		it('lists rebills by state changed before', () => {
			let rebill = getValidRebill();

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_values[':statechangedbeforev']).to.equal('a_state_changed_before');
					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listByState({state_changed_before: 'a_state_changed_before', pagination: 0}).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					rebills: [rebill]
				});
			});
		});

		it('lists rebills by state changed after', () => {
			let rebill = getValidRebill();

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_values[':statechangedafterv']).to.equal('a_state_changed_after');
					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listByState({state_changed_after: 'a_state_changed_after', pagination: 0}).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					rebills: [rebill]
				});
			});
		});
	});

	describe('listProductSchedules', () => {

		it('successfully lists product schedules', () => {
			let rebill = getValidRebill();

			let product_schedule = 'a_product_schedule';

			let query_params = {
				filter_expression: 'a_filter',
				expression_attribute_values: 'an_expression_values'
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array).to.deep.equal(rebill.product_schedules);
					return Promise.resolve(query_params)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/ProductSchedule.js'), class {
				listByAccount() {
					return Promise.resolve({productschedules: [product_schedule]});
				}
			});

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.listProductSchedules(rebill).then((result) => {
				expect(result).to.deep.equal([product_schedule]);
			});
		});
	});

	describe('getRebillsAfterTimestamp', () => {

		it('successfully lists rebills after timestamp', () => {
			const stamp = timestamp.createDate();
			const isoStamp = timestamp.castToISO8601(stamp);

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':timestamp_iso8601v']).to.equal(isoStamp);
					expect(parameters.expression_attribute_values[':processingv']).to.equal('true');

					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.getRebillsAfterTimestamp(stamp).then((result) => {
				expect(result.length).to.equal(1);
				expect(result[0]).to.deep.equal(rebill);
			});

		});
	});

	describe('getRebillsBilledAfter', () => {

		it('successfully lists rebills billed at after', () => {
			const after = '2018-01-20T00:00:00Z';

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':after_iso8601v']).to.equal(after);

					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.getRebillsBilledAfter(after).then((result) => {
				expect(result.length).to.equal(1);
				expect(result[0]).to.deep.equal(rebill);
			});

		});
	});

	describe('getPendingRebills', () => {

		it('builds correct query when listing pending rebills', () => {
			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('rebills');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.filter_expression).to.equal('#processing <> :processingv');
					expect(parameters.expression_attribute_values[':processingv']).to.equal('true');
					expect(parameters.expression_attribute_names['#processing']).to.equal('processing');

					return Promise.resolve({
						Count: 1,
						Items: [rebill]
					});
				}
			});

			const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

			PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			return rebillController.getPendingRebills({pagination: {}, fatal: false, search: {}});
		});
	});

	describe('getResolvedAmount', () => {
		it('sums sale amounts', async () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'success',
							amount: '4.99'
						}, {
							type: 'sale',
							result: 'success',
							amount: '4.99'
						}]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const resolvedAmount = await rebillController.getResolvedAmount(rebill);
			expect(resolvedAmount).to.equal('9.98')
		});

		it('subtracts refund and reverse amounts', async () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'success',
							amount: '9.99'
						}, {
							type: 'refund',
							result: 'success',
							amount: '1.99'
						}, {
							type: 'reverse',
							result: 'success',
							amount: '1.99'
						}]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const resolvedAmount = await rebillController.getResolvedAmount(rebill);
			expect(resolvedAmount).to.equal('6.01')
		});

		it('ignores decline/error transactions', async () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'success',
							amount: '9.99'
						}, {
							type: 'sale',
							result: 'decline',
							amount: '4.99'
						}, {
							type: 'refund',
							result: 'decline',
							amount: '1.99'
						}, {
							type: 'reverse',
							result: 'error',
							amount: '1.99'
						}]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const resolvedAmount = await rebillController.getResolvedAmount(rebill);
			expect(resolvedAmount).to.equal('9.99');
		});
	});

	describe('getPaidStatus', () => {
		it('returns none if no transactions succeeded', async () => {
			const rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'decline',
							amount: '4.99'
						}, {
							type: 'sale',
							result: 'decline',
							amount: '13.99'
						}, {
							type: 'sale',
							result: 'error',
							amount: '1.99'
						}]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const status = await rebillController.getPaidStatus(rebill);
			expect(status).to.equal('none');
		});

		it('returns full if paid amount equals rebill total', async () => {
			const rebill = getValidRebill();
			rebill.amount = '4.99'

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'success',
							amount: '1.99'
						}, {
							type: 'sale',
							result: 'decline',
							amount: '3.00'
						}, {
							type: 'sale',
							result: 'success',
							amount: '3.00'
						}, ]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const status = await rebillController.getPaidStatus(rebill);
			expect(status).to.equal('full');
		});

		it('returns partial if an amount was paid that is less than rebill total', async () => {
			const rebill = getValidRebill();
			rebill.amount = '4.99'

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listTransactionsByRebillID(_rebill) {
					expect(_rebill.id).to.equal(rebill.id);
					return {
						transactions: [{
							type: 'sale',
							result: 'success',
							amount: '1.99'
						}, {
							type: 'sale',
							result: 'decline',
							amount: '3.00'
						}]
					};
				}
			});

			const RebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
			const rebillController = new RebillController();

			const status = await rebillController.getPaidStatus(rebill);
			expect(status).to.equal('partial');
		});
	});
});
