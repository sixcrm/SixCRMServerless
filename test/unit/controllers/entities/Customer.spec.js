let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidSession() {
	return MockEntities.getValidSession()
}

function getValidCustomer() {
	return MockEntities.getValidCustomer()
}

function getValidCreditCard() {
	return MockEntities.getValidCreditCard()
}

function getValidCreditCards() {
	return [MockEntities.getValidCreditCard()]
}

function getValidCustomerNotes() {
	return [MockEntities.getValidCustomerNotes()]
}

describe('controllers/entities/Customer.js', () => {

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

	describe('listCustomerSessions', () => {

		it('returns session list by customer', () => {

			let params = {customer: getValidCustomer(), pagination: 0};

			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), class {
				listByCustomer({customer, pagination}) {
					expect(customer).to.equal(params.customer);
					expect(pagination).to.equal(params.pagination);

					return Promise.resolve({ Items: [{ session: session }]});
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.listCustomerSessions(params).then((result) => {
				expect(result.Items[0].session).to.deep.equal(session);
			});
		});
	});

	describe('getCustomerSessions', () => {

		it('retrieves customer sessions', () => {
			let customer = getValidCustomer();

			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), class {
				getSessionByCustomer(a_customer) {
					expect(a_customer).to.equal(customer.id);
					return Promise.resolve([{session: session}]);
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getCustomerSessions(customer).then((result) => {
				expect(result[0].session).to.deep.equal(session);
			});
		});
	});

	describe('listByCreditCard', () => {

		it('lists customers by credit card', () => {
			let customer = getValidCustomer();

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(customer.creditcards[0]);
					return Promise.resolve({
						Count: 1,
						Items: [customer]
					});
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.listByCreditCard({
				creditcard: customer.creditcards[0], pagination: 0
			}).then((result) => {
				expect(result).to.deep.equal({
					customers: [customer],
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					}
				});
			});
		});
	});

	describe('getAddress', () => {

		it('successfully retrieves customer\'s address', () => {

			let customer = getValidCustomer();

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getAddress(customer).then((result) => {
				expect(result).to.equal(customer.address);
			});
		});
	});

	describe('getCustomerByEmail', () => {

		it('successfully retrieves customer by email', () => {

			let customer = getValidCustomer();

			let mock_entity = class {
				constructor(){}

				getBySecondaryIndex({field, index_value, index_name}) {
					expect(field).to.equal('email');
					expect(index_value).to.equal(customer.email);
					expect(index_name).to.equal('email-index');
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getCustomerByEmail(customer.email).then((result) => {
				expect(result).to.equal(customer);
			});
		});
	});

	describe('getCreditCards', () => {

		it('successfully retrieves credit cards', () => {

			let customer = getValidCustomer();

			let credit_cards = getValidCreditCards();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':id']).to.equal(customer.creditcards[0]);
					return Promise.resolve({
						Count: 2,
						Items: [{}, {}]
					});
				}
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array[0]).to.equal(customer.creditcards[0]);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			let mock_credit_card = class {
				constructor(){}

				batchGet () {
					return Promise.resolve(credit_cards);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getCreditCards(customer).then((result) => {
				expect(result).to.equal(credit_cards);
			});
		});

		it('returns null when customer has no credit cards', () => {

			let customer = getValidCustomer();

			delete customer.creditcards;

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getCreditCards(customer).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('getMostRecentCreditCard', () => {

		it('successfully retrieves most recent credit cards', () => {

			let customer = getValidCustomer();

			let credit_cards = getValidCreditCards();

			credit_cards[1] = {
				updated_at:"2017-12-25T10:21:12.521Z"
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
					return Promise.resolve({
						Count: 1,
						Items: [customer]
					});
				}
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array[0]).to.equal(customer.creditcards[0]);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			let mock_credit_card = class {
				constructor(){}

				batchGet () {
					return Promise.resolve(credit_cards);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getMostRecentCreditCard(customer).then((result) => {
				expect(result).to.equal(credit_cards[0]);
			});
		});

		it('returns first in line credit card when two or more credit cards have the same update date', () => {

			let customer = getValidCustomer();

			let credit_cards = getValidCreditCards();

			credit_cards[1] = {
				updated_at: credit_cards[0].updated_at
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
					return Promise.resolve({
						Count: 1,
						Items: [customer]
					});
				}
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array[0]).to.equal(customer.creditcards[0]);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			let mock_credit_card = class {
				constructor(){}

				batchGet () {
					return Promise.resolve(credit_cards);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getMostRecentCreditCard(customer).then((result) => {
				expect(result).to.equal(credit_cards[0]);
			});
		});

		it('returns null when customer data is empty', () => {

			let customer = getValidCustomer();

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
					return Promise.resolve({
						Count: 0,
						Items: [{}]
					});
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getMostRecentCreditCard(customer).then((result) => {
				expect(result).to.equal(null);
			});
		});

		it('returns null when customer data is null', () => {

			let customer = getValidCustomer();

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('customers');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
					return Promise.resolve({
						Count: 0,
						Items: [null]
					});
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.getMostRecentCreditCard(customer).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('associatedEntitiesCheck', () => {

		it('checks associated entities', () => {

			let session = getValidSession();

			let customer_notes = getValidCustomerNotes();

			let params = {customer: getValidCustomer(), pagination: 0};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), class {
				listByCustomer({customer}) {
					expect(customer).to.equal(params.customer.id);
					return Promise.resolve({ sessions: [session] });
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CustomerNote.js'), class {
				listByCustomer({customer}) {
					expect(customer).to.equal(params.customer.id);
					return Promise.resolve({ customernotes: customer_notes });
				}
			});

			let CustomerController = global.SixCRM.routes.include('controllers','entities/Customer');
			const customerController =  new CustomerController();

			return customerController.associatedEntitiesCheck({id: params.customer.id}).then((result) => {
				expect(result[0]).to.deep.equal({
					name:'Customer Note',
					entity: {
						id: customer_notes[0].id
					}
				});
				expect(result[1]).to.deep.equal({
					name:'Session',
					entity: {
						id: session.id
					}
				});
			});
		});
	});

	describe('addCreditCard', () => {
		it('updates association arrays', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [customer]});
				}
				saveRecord() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer, creditcard)
				.then(([updated_customer, updated_creditcard]) => {
					expect(updated_customer.creditcards).to.include(creditcard.id);
					expect(updated_creditcard.customers).to.include(customer.id);
				});
		});

		it('creates association arrays', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();
			delete customer.creditcards;
			delete creditcard.customers;

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [customer]});
				}
				saveRecord() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer, creditcard)
				.then(([updated_customer, updated_creditcard]) => {
					expect(updated_customer.creditcards).to.deep.equal([creditcard.id]);
					expect(updated_creditcard.customers).to.deep.equal([customer.id]);
				});
		});

		it('when associated does not update', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();
			customer.creditcards = [creditcard.id];
			creditcard.customers = [customer.id];

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer, creditcard)
				.then(([updated_customer, updated_creditcard]) => {
					expect(updated_customer.creditcards).to.deep.equal([creditcard.id]);
					expect(updated_creditcard.customers).to.deep.equal([customer.id]);
				});
		});

		it('retrieves entities from db if ids given', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [customer]});
				}
				saveRecord() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				get() {
					return Promise.resolve(creditcard);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer.id, creditcard.id)
				.then(([updated_customer, updated_creditcard]) => {
					expect(updated_customer.creditcards).to.include(creditcard.id);
					expect(updated_creditcard.customers).to.include(customer.id);
				});
		});

		it('throws error if customer does not exist', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), {
				createActivity: () => {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: []});
				}
				saveRecord() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				get() {
					return Promise.resolve(creditcard);
				}
			});

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer.id, creditcard.id)
				.catch(error => {
					expect(error.message).to.equal(`[500] Customer does not exist: ${customer.id}`);
				});
		});

		it('throws error if creditcard does not exist', () => {
			const customer = getValidCustomer();
			const creditcard = getValidCreditCard();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), {
				createActivity: () => {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [customer]});
				}
				saveRecord() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				get() {
					return Promise.resolve(null);
				}
			});

			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			const customerController =  new CustomerController();

			return customerController.addCreditCard(customer.id, creditcard.id)
				.catch(error => {
					expect(error.message).to.equal(`[500] Creditcard does not exist: ${creditcard.id}`);
				});
		});
	});
});
