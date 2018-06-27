
let chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

function getValidCustomer() {
	return MockEntities.getValidCustomer()
}

function getValidRebill() {
	return MockEntities.getValidRebill()
}

function getValidSession() {
	return MockEntities.getValidSession();
}

describe('controllers/helpers/entities/customer/Customer.js', () => {

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

	describe('getFullName', () => {

		it('successfully retrieves customer\'s full name', () => {

			let customer = getValidCustomer();

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			expect(customerHelperController.getFullName(customer)).to.equal(customer.firstname + ' ' + customer.lastname);

		});

		it('successfully retrieves customer\'s first name', () => {

			let customer = getValidCustomer();

			delete customer.lastname;

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			expect(customerHelperController.getFullName(customer)).to.equal(customer.firstname);

		});

		it('successfully retrieves customer\'s last name', () => {

			let customer = getValidCustomer();

			delete customer.firstname;

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			expect(customerHelperController.getFullName(customer)).to.equal(customer.lastname);

		});

		it('returns empty string when customer\'s name is undefined', () => {

			let customer = getValidCustomer();

			delete customer.firstname;
			delete customer.lastname;

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			expect(customerHelperController.getFullName(customer)).to.equal('');

		});

	});

	describe('customerSessionBySecondaryIdentifier', () => {

		it('successfully retrieves customer session by customer email and session id', () => {

			let customer = getValidCustomer();

			let session = getValidSession();

			let params = {
				customer: customer.email,
				secondary_identifier: {
					type: 'session.id',
					value: session.id
				}
			};

			let mock_session_helper = class {
				constructor(){}

				getSessionByCustomerAndID({customer, id}){
					expect(customer).to.deep.equal(params.customer);
					expect(id).to.equal(params.secondary_identifier.value);
					return Promise.resolve(session);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/session/Session.js'), mock_session_helper);

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			return customerHelperController.customerSessionBySecondaryIdentifier(params).then((result) => {
				expect(result).to.equal(session);
				expect(customerHelperController.parameters.store['customer']).to.deep.equal(params.customer);
				expect(customerHelperController.parameters.store['secondaryidentifier'])
					.to.deep.equal(params.secondary_identifier);
			});
		});

		it('successfully retrieves customer session by customer email and session alias', () => {

			let customer = getValidCustomer();

			let session = getValidSession();

			let params = {
				customer: customer.email,
				secondary_identifier: {
					type: 'session.alias',
					value: session.alias
				}
			};

			let mock_session_helper = class {
				constructor(){}

				getSessionByCustomerAndAlias({customer, alias}){
					expect(customer).to.deep.equal(params.customer);
					expect(alias).to.equal(params.secondary_identifier.value);
					return Promise.resolve(session);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/session/Session.js'), mock_session_helper);

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			let customerHelperController = new CustomerHelperController();

			return customerHelperController.customerSessionBySecondaryIdentifier(params).then((result) => {
				expect(result).to.equal(session);
				expect(customerHelperController.parameters.store['customer']).to.deep.equal(params.customer);
				expect(customerHelperController.parameters.store['secondaryidentifier'])
					.to.deep.equal(params.secondary_identifier);
			});
		});
	});

	describe('getPastRebills', () => {
		it('retrieves rebills', async () => {
			const customer = getValidCustomer();
			const session = getValidSession();
			const rebill = getValidRebill();
			const pagination = {};
			const query_parameters = {};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				async getSessionByCustomer(_customer) {
					expect(_customer).to.equal(customer);
					return [session];
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				createINQueryParameters({field, list_array}) {
					expect(field).to.equal('parentsession');
					expect(list_array).to.deep.equal([session.id]);
					return query_parameters;
				}
				appendFilterExpression(parameters, expression) {
					expect(parameters).to.equal(query_parameters);
					expect(expression).to.equal('#bill_at <= :bill_at');
					return query_parameters;
				}
				appendExpressionAttributeNames(parameters, key, value) {
					expect(parameters).to.equal(query_parameters);
					expect(key).to.equal('#bill_at');
					expect(value).to.equal('bill_at');
					return query_parameters;
				}
				appendExpressionAttributeValues(parameters, key) {
					expect(parameters).to.equal(query_parameters);
					expect(key).to.equal(':bill_at');
					return query_parameters;
				}
				async listByAccount({query_parameters: parameters, pagination: _pagination}) {
					expect(parameters).to.equal(query_parameters);
					expect(_pagination).to.equal(pagination);
					return {
						pagination: {
							count: 1,
							end_cursor: '',
							has_next_page: 'false',
							last_evaluated: ''
						},
						rebills: [rebill]
					}
				}
			});

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			const customerHelperController = new CustomerHelperController();

			const result = await customerHelperController.getPastRebills({customer, pagination});
			expect(result.rebills).to.deep.equal([rebill]);
			expect(result.pagination).to.deep.equal({
				count: 1,
				end_cursor: '',
				has_next_page: 'false',
				last_evaluated: ''
			});
		});

		it('returns empty result when no sessions exist', async () => {
			const customer = getValidCustomer();
			const pagination = {};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				async getSessionByCustomer(_customer) {
					expect(_customer).to.equal(customer);
					return null;
				}
			});

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			const customerHelperController = new CustomerHelperController();

			const result = await customerHelperController.getPastRebills({customer, pagination});
			expect(result.rebills).to.deep.equal(null);
			expect(result.pagination).to.deep.equal({
				count: 0,
				end_cursor: '',
				has_next_page: 'false',
				last_evaluated: ''
			});
		});
	});

	describe('getPendingRebills', () => {
		it('retrieves rebills', async () => {
			const customer = getValidCustomer();
			const session = getValidSession();
			const rebill = getValidRebill();
			rebill.bill_at  = timestamp.nextMonth();
			const pagination = {};
			const query_parameters = {};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				async getSessionByCustomer(_customer) {
					expect(_customer).to.equal(customer);
					return [session];
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				createINQueryParameters({field, list_array}) {
					expect(field).to.equal('parentsession');
					expect(list_array).to.deep.equal([session.id]);
					return query_parameters;
				}
				appendFilterExpression(parameters, expression) {
					expect(parameters).to.equal(query_parameters);
					expect(expression).to.equal('#bill_at > :bill_at');
					return query_parameters;
				}
				appendExpressionAttributeNames(parameters, key, value) {
					expect(parameters).to.equal(query_parameters);
					expect(key).to.equal('#bill_at');
					expect(value).to.equal('bill_at');
					return query_parameters;
				}
				appendExpressionAttributeValues(parameters, key) {
					expect(parameters).to.equal(query_parameters);
					expect(key).to.equal(':bill_at');
					return query_parameters;
				}
				async listByAccount({query_parameters: parameters, pagination: _pagination}) {
					expect(parameters).to.equal(query_parameters);
					expect(_pagination).to.equal(pagination);
					return {
						pagination: {
							count: 1,
							end_cursor: '',
							has_next_page: 'false',
							last_evaluated: ''
						},
						rebills: [rebill]
					}
				}
			});

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			const customerHelperController = new CustomerHelperController();

			const result = await customerHelperController.getPendingRebills({customer, pagination});
			expect(result.rebills).to.deep.equal([rebill]);
			expect(result.rebills[0].bill_at > timestamp.getISO8601()).to.equal(true);
			expect(result.pagination).to.deep.equal({
				count: 1,
				end_cursor: '',
				has_next_page: 'false',
				last_evaluated: ''
			});
		});

		it('returns empty result when no sessions exist', async () => {
			const customer = getValidCustomer();
			const pagination = {};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				async getSessionByCustomer(_customer) {
					expect(_customer).to.equal(customer);
					return null;
				}
			});

			const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
			const customerHelperController = new CustomerHelperController();

			const result = await customerHelperController.getPendingRebills({customer, pagination});
			expect(result.rebills).to.deep.equal(null);
			expect(result.pagination).to.deep.equal({
				count: 0,
				end_cursor: '',
				has_next_page: 'false',
				last_evaluated: ''
			});
		});
	});

});
