let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidLoadBalancer() {
    return MockEntities.getValidLoadBalancer()
}

describe('controllers/LoadBalancer.js', () => {

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

    describe('listByMerchantProviderID', () => {

        it('lists load balancer by merchant provider', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([load_balancer]);
            });
        });

        it('returns an empty array when there are no loadbalancers with corresponding merchant provider id', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: []
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when there aren\'t any merchant providers', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            delete load_balancer.merchantproviders;

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when merchant providers don\'t have any data', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: load_balancer.merchantproviders[0].id};

            load_balancer.merchantproviders = [];

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });

        it('returns an empty array when merchant provider with specified id does not exist', () => {

            let load_balancer = getValidLoadBalancer();

            let merchant_provider = {id: 'dummy_id'};

            PermissionTestGenerators.givenUserWithAllowed('read', 'loadbalancer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('loadbalancers');
                    expect(parameters).to.have.property('expression_attribute_names');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({
                        Count: 1,
                        Items: [load_balancer]
                    });
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers','entities/LoadBalancer.js');

            return loadBalancerController.listByMerchantProviderID(merchant_provider).then((result) => {
                expect(result).to.deep.equal([]);
            });
        });
    });

    describe('getMerchantProviderConfigurations', () => {

        it('successfully retrieves merchant provider configurations', () => {
            let load_balancer = getValidLoadBalancer();

            let loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

            expect(loadBalancerController.getMerchantProviderConfigurations(load_balancer)).to.deep.equal([{
                distribution: load_balancer.merchantproviders[0].distribution,
                merchantprovider: load_balancer.merchantproviders[0].id
            }]);
        })
    });

    describe('getMerchantProviderConfiguration', () => {

        it('retrieves merchant provider configuration', () => {
            let merchant_provider_configuration = {
                merchantprovider: 'dummy_id'
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/MerchantProvider.js'), {
                get: ({id}) => {
                    expect(id).to.equal(merchant_provider_configuration.merchantprovider);
                    return Promise.resolve('a_merchant_provider');
                }
            });

            let loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

            return loadBalancerController.getMerchantProviderConfiguration(merchant_provider_configuration).then((result) => {
                expect(result).to.deep.equal('a_merchant_provider');
            });
        })
    });
});