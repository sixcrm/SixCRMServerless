let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidFulfillmentProvider() {
    return {
        "id":"1bd805d0-0062-499b-ae28-00c5d1b827ba",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name":"Hashtag Fulfillment Provider",
        "provider":{
            "name":"Hashtag",
            "threepl_key":"{2b8d696e-9ee1-4a7d-8655-2e7979dfc7f3}",
            "threepl_customer_id":10,
            "username":"kristest",
            "password":"kristest"
        },
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

function getValidProduct() {
    return {
        "id": "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name": "Test Product",
        "sku":"123",
        "ship":true,
        "shipping_delay":3600,
        "fulfillment_provider":"1bd805d0-0062-499b-ae28-00c5d1b827ba",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/Product.js', () => {

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

    describe('listByFulfillmentProvider', () => {

        it('lists products by fulfillment provider', () => {

            let product = getValidProduct();

            let params = {
                fulfillment_provider: getValidFulfillmentProvider(),
                pagination: 0
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'product');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
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

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

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

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), {
                get: ({id}) => {
                    expect(id).to.equal(product.fulfillment_provider);
                    return Promise.resolve(fulfillment_provider);
                }
            });

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

            return productController.getFulfillmentProvider(product).then((result) => {
                expect(result).to.deep.equal(fulfillment_provider);
            });
        });

        it('returns null when product does not have a fulfillment provider', () => {

            let product = getValidProduct();

            delete product.fulfillment_provider;

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

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

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                listByProduct: ({product, pagination}) => {
                    expect(product).to.equal(params.product);
                    expect(pagination).to.equal(params.pagination);
                    return Promise.resolve(a_product_schedules);
                }
            });

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

            return productController.getProductSchedules(params).then((result) => {
                expect(result).to.deep.equal(a_product_schedules);
            });
        });

        it('throws error when product argument is missing', () => {

            let product = getValidProduct();

            delete product.fulfillment_provider;

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

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

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                listByProduct: ({product}) => {
                    expect(product).to.equal(product_data.id);
                    return Promise.resolve({productschedules: [a_product_schedule]});
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                listByProductID: ({id}) => {
                    expect(id).to.equal(product_data.id);
                    return Promise.resolve({transactions: [a_transaction]});
                }
            });

            let productController = global.SixCRM.routes.include('controllers','entities/Product.js');

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
});