const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

function getValidLoadBalancer() {
    return {
        "id":"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
        "name": "Seed load balancer",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "merchantproviders":[
            {
                "id":"6c40761d-8919-4ad6-884d-6a46a776cfb9",
                "distribution":0.75
            },
            {
                "id":"79189a4a-ed89-4742-aa96-afcd7f6c08fb",
                "distribution":0.25
            }
        ],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/MerchantProvider.js', () => {

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

    describe('associatedEntitiesCheck', () => {

        it('creates associated entities object', () => {

            let a_merchant_provider_id = 'dummy_id';

            let loadbalancer = getValidLoadBalancer();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/LoadBalancer.js'), {
                listByMerchantProviderID: ({id}) => {
                    expect(id).to.equal(a_merchant_provider_id);
                    return Promise.resolve([loadbalancer]);
                }
            });

            let merchantProviderController = global.SixCRM.routes.include('controllers','entities/MerchantProvider.js');

            return merchantProviderController.associatedEntitiesCheck({id : a_merchant_provider_id}).then((result) => {
                expect(result).to.deep.equal([{
                    entity: {
                        id: loadbalancer.id
                    },
                    name: "Load Balancer"
                }]);
            });
        });

        it('throws error when object is missing an id', () => {

            let a_merchant_provider_id = 'dummy_id';

            let loadbalancer = getValidLoadBalancer();

            delete loadbalancer.id;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/LoadBalancer.js'), {
                listByMerchantProviderID: ({id}) => {
                    expect(id).to.equal(a_merchant_provider_id);
                    return Promise.resolve([loadbalancer]);
                }
            });

            let merchantProviderController = global.SixCRM.routes.include('controllers','entities/MerchantProvider.js');

            return merchantProviderController.associatedEntitiesCheck({id : a_merchant_provider_id}).catch((error) => {
                expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
            });
        });
    });
});