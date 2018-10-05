let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidFulfillmentProvider() {
	return MockEntities.getValidFulfillmentProvider()
}

function getValidProduct() {
	return MockEntities.getValidProduct()
}

describe('controllers/Product.js', () => {

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

	describe('listByFulfillmentProvider', () => {

		it('lists products by fulfillment provider', () => {

			let product = getValidProduct();

			let params = {
				fulfillment_provider: getValidFulfillmentProvider(),
				pagination: 0
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'product');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('products');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':fulfillmentprovider_id']).to.equal(params.fulfillment_provider.id);
					return Promise.resolve({
						Count: 1,
						Items: [product]
					});
				}
			});

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			return productController.listByFulfillmentProvider(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					products: [product]
				});
			});
		});
	});

	describe('getFulfillmentProvider', () => {

		it('successfully retrieves fulfillment provider', () => {

			let product = getValidProduct();

			let fulfillment_provider = getValidFulfillmentProvider();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), class {
				get({id}) {
					expect(id).to.equal(product.fulfillment_provider);
					return Promise.resolve(fulfillment_provider);
				}
			});

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			return productController.getFulfillmentProvider(product).then((result) => {
				expect(result).to.deep.equal(fulfillment_provider);
			});
		});

		it('returns null when product does not have a fulfillment provider', () => {

			let product = getValidProduct();

			delete product.fulfillment_provider;

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			return productController.getFulfillmentProvider(product).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('getProductSchedules', () => {

		it('successfully retrieves product schedules', () => {
			let product= getValidProduct();

			let params = {
				product: product.id,
				pagination: 0
			};

			let a_product_schedules = ['a_product_schedule'];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), class {
				listByProduct({product, pagination}) {
					expect(product).to.equal(params.product);
					expect(pagination).to.equal(params.pagination);
					return Promise.resolve(a_product_schedules);
				}
			});

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			return productController.getProductSchedules(params).then((result) => {
				expect(result).to.deep.equal(a_product_schedules);
			});
		});

		it('throws error when product argument is missing', () => {

			let product = getValidProduct();

			delete product.fulfillment_provider;

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			try {
				productController.getProductSchedules({})
			}catch(error) {
				expect(error.message).to.equal('[400] getProductSchedules requires a product argument.');
			}
		});
	});

	describe('associatedEntitiesCheck', () => {

		it('creates associated entities objects', () => {

			let product_data = getValidProduct();

			let a_product_schedule = {id: 'dummy_product_schedule_id'};

			let a_transaction = {id: 'dummy_transaction_id'};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), class {
				listByProduct({product}) {
					expect(product).to.equal(product_data.id);
					return Promise.resolve({productschedules: [a_product_schedule]});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				listByProductID({id}) {
					expect(id).to.equal(product_data.id);
					return Promise.resolve({transactions: [a_transaction]});
				}
			});

			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();

			return productController.associatedEntitiesCheck({id: product_data.id}).then((result) => {
				expect(result).to.deep.equal([
					{
						entity: {
							id: a_product_schedule.id
						},
						name: "Product Schedule"
					},
					{
						entity: {
							id: a_transaction.id
						},
						name: "Transaction"
					}
				]);
			});
		});
	});

	describe('validateDynamicPrice', () => {
		it('returns true if price is within range', () => {
			const product = getValidProduct();
			product.default_price = 10.00;
			product.dynamic_pricing = {
				min: 8.00,
				max: 11.00
			};
			const price = 9.00;
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();
			expect(productController.validateDynamicPrice(product, price)).to.be.true;
		});

		it('returns false if product has no dynamic pricing', () => {
			const product = getValidProduct();
			const price = 9.00;
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();
			expect(productController.validateDynamicPrice(product, price)).to.be.false;
		});

		it('returns true if price matches default_price', () => {
			const product = getValidProduct();
			product.default_price = 9.00;
			const price = 9.00;
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();
			expect(productController.validateDynamicPrice(product, price)).to.be.true;
		});


		it('returns false if price is below minimum', () => {
			const product = getValidProduct();
			product.default_price = 10.00;
			product.dynamic_pricing = {
				min: 8.00,
				max: 11.00
			};
			const price = 7.99;
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();
			expect(productController.validateDynamicPrice(product, price)).to.be.false;
		});

		it('returns false if price is above maximum', () => {
			const product = getValidProduct();
			product.default_price = 10.00;
			product.dynamic_pricing = {
				min: 8.00,
				max: 11.00
			};
			const price = 11.01;
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			const productController = new ProductController();
			expect(productController.validateDynamicPrice(product, price)).to.be.false;
		});
	});
});
