
let chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCustomer() {
	return MockEntities.getValidCustomer()
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

});
