let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/Transaction.js', () => {

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

	describe('createAlias', () => {

		it('successfully creates alias', () => {

			let random_string = 'a_random_string';

			mockery.registerMock('@sixcrm/sixcrmcore/util/random', {
				default: {
					createRandomString: () => {
						return random_string;
					}
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers','entities/Transaction.js');
			const transactionController = new TransactionController();

			expect(transactionController.createAlias()).to.equal('T' + random_string);
		});
	});

	describe('getProduct', () => {

		it('successfully retrieves a product', () => {

			let a_product = {
				id: 'dummy_id'
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Product.js'), class {
				get({id}) {
					expect(id).to.equal(a_product.id);
					return Promise.resolve('a_product_data');
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers','entities/Transaction.js');
			const transactionController = new TransactionController();

			return transactionController.getProduct(a_product).then((result) => {
				expect(result).to.equal('a_product_data');
			});
		});
	});

	describe('getMerchantProvider', () => {

		it('successfully retrieves a merchant provider', () => {

			let a_transaction = {
				merchant_provider: {
					id: 'dummy_id'
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/MerchantProvider.js'), class {
				get({id}) {
					expect(id).to.equal(a_transaction.merchant_provider.id);
					return Promise.resolve('a_merchant_provider');
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers','entities/Transaction.js');
			const transactionController = new TransactionController();

			return transactionController.getMerchantProvider(a_transaction).then((result) => {
				expect(result).to.equal('a_merchant_provider');
			});
		});
	});

	describe('listByAssociatedTransaction', () => {

		it('successfully list by parent transaction', () => {

			let params = {
				id: {
					id: 'dummy_id'
				},
				rebill: 'rebill_id',
				types: [
					'a_type',
					'another_type'
				]
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'transaction');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('rebill-index');
					expect(table).to.equal('transactions');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':associated_transaction_id']).to.equal(params.id.id);
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal(params.rebill);
					expect(parameters.expression_attribute_values[':typea_type']).to.equal(params.types[0]);
					expect(parameters.expression_attribute_values[':typeanother_type']).to.equal(params.types[1]);
					return Promise.resolve({
						Count: 1,
						Items: ['a_transaction']
					});
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers','entities/Transaction.js');
			const transactionController = new TransactionController();

			return transactionController.listByAssociatedTransaction(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					transactions: ['a_transaction']
				});
			});
		});
	});
});
