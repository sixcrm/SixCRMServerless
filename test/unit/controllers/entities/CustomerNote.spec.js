let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/CustomerNote.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

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

	describe('getCustomer', () => {

		it('successfully retrieves customer with specified id', () => {

			let customer_note = {
				customer: 'dummy_id'
			};

			let mock_customer = class {
				constructor(){}

				get({id}) {
					expect(id).to.equal(customer_note.customer);
					return Promise.resolve('a_customer')
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let CustomerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.getCustomer(customer_note).then((result) => {
				expect(result).to.equal('a_customer');
			});
		});
	});

	describe('getUser', () => {

		it('successfully retrieves user with specified id', () => {

			let customer_note = {
				user: 'dummy_id'
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				get({id}) {
					expect(id).to.equal(customer_note.user);
					return Promise.resolve('a_user')
				}
			});

			let CustomerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.getUser(customer_note).then((result) => {
				expect(result).to.equal('a_user');
			});
		});
	});

	describe('listByCustomer', () => {

		it('successfully lists customer notes by customer', () => {

			let params = {
				customer: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'customernote');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('customer-index');
					expect(table).to.equal('customernotes');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters.expression_attribute_names['#customer']).to.equal('customer');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal(params.customer.id);
					return Promise.resolve({
						Count: 1,
						Items: ['a_customer_note']
					});
				}
			});

			let CustomerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');
			const customerNoteController = new CustomerNoteController();

			return customerNoteController.listByCustomer(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					customernotes: ['a_customer_note']
				});
			});
		});
	});
});
