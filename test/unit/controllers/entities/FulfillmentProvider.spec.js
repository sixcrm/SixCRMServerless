const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

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

describe('controllers/FulfillmentProvider.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        mockery.resetCache();
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    describe('', () => {

        it('creates associated entities object', () => {

            let a_fulfillment_provider_id = 'dummy_id';

            let product = getValidProduct();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Product.js'), {
                listByFulfillmentProvider: ({fulfillment_provider}) => {
                    expect(fulfillment_provider).to.equal(a_fulfillment_provider_id);
                    return Promise.resolve({products: [product]});
                }
            });

            let fulfillmentProviderController = global.SixCRM.routes.include('controllers','entities/FulfillmentProvider.js');

            return fulfillmentProviderController.associatedEntitiesCheck({id : a_fulfillment_provider_id}).then((result) => {
                expect(result).to.deep.equal([{
                    entity: {
                        id: product.id
                    },
                    name: "Product"
                }]);
            });
        });

        it('throws error when object is missing an id', () => {

            let a_fulfillment_provider_id = 'dummy_id';

            let product = getValidProduct();

            delete product.id;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Product.js'), {
                listByFulfillmentProvider: ({fulfillment_provider}) => {
                    expect(fulfillment_provider).to.equal(a_fulfillment_provider_id);
                    return Promise.resolve({products: [product]});
                }
            });

            let fulfillmentProviderController = global.SixCRM.routes.include('controllers','entities/FulfillmentProvider.js');

            return fulfillmentProviderController.associatedEntitiesCheck({id : a_fulfillment_provider_id}).catch((error) => {
                expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
            });
        });
    });
});