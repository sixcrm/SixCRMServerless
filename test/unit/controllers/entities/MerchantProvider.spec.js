const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidLoadBalancer() {
    return MockEntities.getValidLoadBalancer()
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