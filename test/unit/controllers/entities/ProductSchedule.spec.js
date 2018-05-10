let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidProductSchedule() {
	return MockEntities.getValidProductSchedule()
}

describe('controllers/ProductSchedule.js', () => {

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

	describe('listByProduct', () => {

		it('lists product schedules by product', () => {

			let product_schedule = getValidProductSchedule();

			let params = {
				product: {
					id: product_schedule.schedule[0].product
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({
						Items: [product_schedule]
					});
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listByProduct(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					productschedules: [product_schedule]
				});
			});
		});

		it('returns empty product schedule list when product does not have any', () => {
			let params = {
				product: {
					id: '616cc994-9480-4640-b26c-03810a679fe3'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({
						Items: []
					});
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listByProduct(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					productschedules: []
				});
			});
		});

		it('returns empty product schedule list when there are no schedules', () => {
			let params = {
				product: {
					id: '616cc994-9480-4640-b26c-03810a679fe3'
				},
				pagination: 0
			};

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [];

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({
						Items: [product_schedule]
					});
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listByProduct(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					productschedules: []
				});
			});
		});

		it('returns empty product schedule list when schedule with expected product id does not exist', () => {
			let params = {
				product: {
					id: '616cc994-9480-4640-b26c-03810a679fe3'
				},
				pagination: 0
			};

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule[0].product = 'dummy_id';

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					return Promise.resolve({
						Items: [product_schedule]
					});
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listByProduct(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 0,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					productschedules: []
				});
			});
		});
	});

	describe('getMerchantProviderGroup', () => {

		it('successfully retrieves merchantprovidergroup', () => {

			let product_schedule = getValidProductSchedule();

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/MerchantProviderGroup.js'), class {
				get({id}) {
					expect(id).to.equal(product_schedule.merchantprovidergroup);
					return Promise.resolve('a_merchantprovidergroup');
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.getMerchantProviderGroup(product_schedule).then((result) => {
				expect(result).to.equal('a_merchantprovidergroup');
			});
		});

		it('returns null when product schedule does not have a merchantprovidergroup', () => {

			let product_schedule = getValidProductSchedule();

			delete product_schedule.merchantprovidergroup;

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.getMerchantProviderGroup(product_schedule).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('getProduct', () => {

		it('successfully retrieves product', () => {

			let product_schedule = getValidProductSchedule();

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Product.js'), class {
				get({id}) {
					expect(id).to.equal(product_schedule.schedule[0].product);
					return Promise.resolve('a_product');
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.getProduct(product_schedule.schedule[0]).then((result) => {
				expect(result).to.equal('a_product');
			});
		});
	});

	describe('getProducts', () => {

		it('successfully retrieves products list', () => {

			let product_schedule = getValidProductSchedule();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array[0]).to.deep.equal(product_schedule.schedule[0].product);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Product.js'), class {
				listByAccount() {
					return Promise.resolve(['a_product']);
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.getProducts(product_schedule).then((result) => {
				expect(result).to.deep.equal(['a_product']);
			});
		});
	});

	describe('listProductSchedulesByList', () => {

		it('successfully lists product schedules by their ids', () => {

			let product_schedule = getValidProductSchedule();

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				createINQueryParameters(field, list_array) {
					expect(field).to.equal('id');
					expect(list_array).to.deep.equal([product_schedule.id]);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters.filter_expression).to.equal('a_filter');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values).to.equal('an_expression_values');
					return Promise.resolve([product_schedule]);
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listProductSchedulesByList({product_schedules: [product_schedule.id]}).then((result) => {
				expect(result).to.deep.equal([product_schedule]);
			});
		});
	});

	describe('listByMerchantProviderGroup', () => {

		it('successfully lists product schedules by merchant provider group', () => {

			let product_schedule = getValidProductSchedule();

			let params = {
				merchantprovidergroup: {
					id: 'dummy_id'
				},
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'productschedule');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('productschedules');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':merchantprovidergroup_id']).to.equal(params.merchantprovidergroup.id);
					return Promise.resolve([product_schedule]);
				}
			});

			let ProductScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule.js');
			const productScheduleController = new ProductScheduleController();

			return productScheduleController.listByMerchantProviderGroup(params).then((result) => {
				expect(result).to.deep.equal([product_schedule]);
			});
		});
	});
});
