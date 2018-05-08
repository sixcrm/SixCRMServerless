const _ = require('lodash');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidSession() {
	return MockEntities.getValidSession();
}

function getValidRebill(){
	return MockEntities.getValidRebill();
}

function getValidTransaction(){
	return MockEntities.getValidTransaction();
}

function getValidCreditCard() {
	return MockEntities.getValidCreditCard()
}

describe('controllers/Session.js', () => {

	before(() => {
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
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('getAffiliateIDs', () => {

		it('successfully retrieves affiliate IDs', () => {
			let session = getValidSession();

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getAffiliateIDs(session.id).then((result) => {
				expect(result).to.deep.equal([
					"affiliate",
					"subaffiliate_1",
					"subaffiliate_2",
					"subaffiliate_3",
					"subaffiliate_4",
					"subaffiliate_5",
					"cid"
				]);
			});
		});

		it('returns an empty array when affiliate field type is unrecognized', () => {
			let session = getValidSession();

			session.affiliate = 111;
			session.subaffiliate_1 = {};
			session.subaffiliate_2 = [];
			session.subaffiliate_3 = -111;
			session.subaffiliate_4 = 11.22;
			session.subaffiliate_5 = "111";
			session.cid = "any string";

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getAffiliateIDs(session.id).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});

		it('returns an empty array when affiliate fields are missing', () => {
			let session = {
				id: "dummy_id"
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({
						Items: [session]
					});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getAffiliateIDs(session.id).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});
	});

	describe('getCampaign', () => {

		it('returns null when session does not have a campaign data', () => {
			let session = getValidSession();

			delete session.campaign;

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			expect(sessionController.getCampaign(session)).to.equal(null);
		});

		it('successfully retrieves campaign', () => {
			let session = getValidSession();

			let mock_campaign = class {
				constructor(){}

				get ({id}) {
					expect(id).to.equal(session.campaign);
					return Promise.resolve('a_campaign');
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getCampaign(session).then((result) => {
				expect(result).to.equal('a_campaign');
			});
		});
	});

	describe('getCustomer', () => {

		it('returns null when session does not have a customer data', () => {
			let session = getValidSession();

			delete session.customer;

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			expect(sessionController.getCustomer(session)).to.equal(null);
		});

		it('successfully retrieves customer', () => {
			let session = getValidSession();

			let mock_customer = class {
				constructor(){}

				get({id}) {
					expect(id).to.equal(session.customer);
					return Promise.resolve('a_customer');
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getCustomer(session).then((result) => {
				expect(result).to.equal('a_customer');
			});
		});
	});

	describe('getCampaignHydrated', () => {

		it('returns hydrated campaign', () => {
			let session = getValidSession();

			let hydrated_campaign = {
				productschedules: ['a_product_schedule']
			};

			let mock_campaign = class {
				constructor(){}

				getHydratedCampaign({id}) {
					expect(id).to.equal(session.id);
					return Promise.resolve(hydrated_campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getCampaignHydrated(session).then((result) => {
				expect(result).to.equal(hydrated_campaign);
			});
		});
	});

	describe('getAffiliate', () => {

		it('successfully acquires affiliate', () => {
			let session = getValidSession();

			let affiliate_field = "subaffiliate_1"; //valid field

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Affiliate.js'), class {
				get({id}) {
					expect(id).to.equal(session[affiliate_field]);
					return Promise.resolve('an_affiliate');
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getAffiliate(session, affiliate_field).then((result) => {
				expect(result).to.equal('an_affiliate');
			});
		});

		it('returns null when affiliate field is not valid UUID', () => {
			let session = getValidSession();

			let affiliate_field = "subaffiliate_1";

			session.subaffiliate_1 = "some random value"; //unexpected value

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			expect(sessionController.getAffiliate(session, affiliate_field)).to.equal(null);
		});

		it('returns null when session does not have appointed affiliate field', () => {
			let session = getValidSession();

			let affiliate_field = "some_random_value"; //invalid field

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			expect(sessionController.getAffiliate(session, affiliate_field)).to.equal(null);
		});
	});

	describe('listByAffiliate', () => {

		it('lists sessions by affiliate', () => {
			let session = getValidSession();

			let params = {
				affiliate: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('sessions');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':affiliate_id']).to.equal(params.affiliate.id);
					return Promise.resolve({
						Count: 1,
						Items: [session]
					});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listByAffiliate(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					sessions: [session]
				});
			});
		});
	});

	describe('listRebills', () => {

		it('successfully lists rebills', () => {
			let session_data = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession({session}) {
					expect(session).to.equal(session_data);
					return Promise.resolve({rebills: ['a_rebill']});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listRebills(session_data).then((result) => {
				expect(result).to.deep.equal(['a_rebill']);
			});
		});
	});

	describe('listProductSchedules', () => {

		it('returns null when session does not have a product schedule', () => {
			let session = getValidSession();

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listProductSchedules(session).then((result) => {
				expect(result).to.deep.equal(null);
			});
		});

		it('successfully lists product schedules', () => {
			let session = getValidSession();

			session.product_schedules = ['a_product_schedule_id'];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array).to.equal(session.product_schedules);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/ProductSchedule.js'), class {
				listByAccount() {
					return Promise.resolve(['a_product_schedule']);
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listProductSchedules(session).then((result) => {
				expect(result).to.deep.equal(['a_product_schedule']);
			});
		});
	});

	describe('listByCampaign', () => {

		it('list sessions by campaign', () => {
			let session = getValidSession();

			let params = {
				campaign: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('sessions');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':field_value']).to.equal(params.campaign.id);
					return Promise.resolve({
						Count: 1,
						Items: [session]
					});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listByCampaign(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					sessions: [session]
				});
			});
		});
	});

	describe('getSessionByCustomer', () => {

		it('retrieves session by customer', () => {
			let session = getValidSession();

			let customer = {
				id: 'dummy_id'
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(table).to.equal('sessions');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(index).to.equal('customer-index');
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal(customer.id);
					return Promise.resolve({ Items: [{sessions: session}] });
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getSessionByCustomer(customer).then((result) => {
				expect(result).to.deep.equal([{sessions: session}]);
			});
		});
	});

	describe('closeSession', () => {

		it('successfully closes session', () => {
			let session = getValidSession();

			let updatedSession = session;

			updatedSession.completed = true;

			PermissionTestGenerators.givenUserWithAllowed('update', 'session');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters ) {
					expect(table).to.equal('sessions');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(session.id);
					return Promise.resolve({Items: [session]});
				}
				saveRecord(tableName, entity) {
					expect(entity).to.deep.equal(session);
					expect(tableName).to.equal('sessions');
					return Promise.resolve(updatedSession);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.closeSession(session).then((result) => {
				expect(result).to.deep.equal(updatedSession);
			});
		});
	});

	describe('listTransactions', () => {

		it('returns null when session does not have rebills', () => {

			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession() {
					return Promise.resolve('session without rebills');
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listTransactions(session).then((result) => {
				expect(result).to.equal(null);
			});
		});

		it('returns null when session rebills list is empty', () => {

			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession() {
					return Promise.resolve({rebills : []});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listTransactions(session).then((result) => {
				expect(result).to.equal(null);
			});
		});

		it('returns null when transaction list is empty', () => {

			let session = getValidSession();

			let session_rebills = {
				rebills: [{
					id: 'dummy_id'
				}]
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession() {
					return Promise.resolve(session_rebills);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), class {
				listTransactionsByRebillID({id}) {
					expect(id).to.equal(session_rebills.rebills[0].id);
					return Promise.resolve([]);
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listTransactions(session).then((result) => {
				expect(result).to.deep.equal(null);
			});
		});

		it('returns null when there aren\'t any rebill transactions', () => {

			let session = getValidSession();

			let session_rebills = {
				rebills: [{
					id: 'dummy_id'
				}]
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession() {
					return Promise.resolve(session_rebills);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), class {
				listTransactionsByRebillID({id}) {
					expect(id).to.equal(session_rebills.rebills[0].id);
					return Promise.resolve();
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listTransactions(session).then((result) => {
				expect(result).to.deep.equal(null);
			});
		});

		it('returns list of transactions', () => {

			let session = getValidSession();
			let transaction = getValidTransaction();
			let session_rebills = {
				rebills: [
					getValidRebill()
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Rebill.js'), class {
				listBySession() {
					return Promise.resolve(session_rebills);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Transaction.js'), class {
				listTransactionsByRebillID({id}) {
					expect(id).to.equal(session_rebills.rebills[0].id);
					return Promise.resolve({transactions: [transaction]});
				}
			});

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.listTransactions(session).then((result) => {
				expect(result).to.deep.equal([transaction]);
			});
		});
	});

	describe('cancelSession', () => {

		it('returns 404 if invalid id', () => {

			let mock_cancel = {
				id: 'mock id',
				cancelled: true,
				cancelled_by: 'test@user.com'
			}

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.cancelSession({entity: mock_cancel}).catch((error) => {

				expect(error.message).to.equal('[404] Unable to update session with ID: "mock id" -  record doesn\'t exist.');

			});

		});

	});

	describe('getSessionCreditCard', () => {

		it('successfully acquires most recent credit card', () => {

			let session = getValidSession();

			let credit_card = getValidCreditCard();

			let mock_customer = class {
				constructor(){}

				getMostRecentCreditCard({id}) {
					expect(id).to.equal(session.customer);
					return Promise.resolve(credit_card);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			return sessionController.getSessionCreditCard(session).then((result) => {
				expect(result).to.equal(credit_card);
			});
		});
	});

	describe('createAlias', () => {

		it('successfully creates alias', () => {

			let session = getValidSession();

			let SessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
			const sessionController = new SessionController();

			let alias = sessionController.createAlias(session);

			expect(alias).to.be.a('string');
			expect(_.includes(alias, 'S')).to.equal(true);
		});
	});
});
