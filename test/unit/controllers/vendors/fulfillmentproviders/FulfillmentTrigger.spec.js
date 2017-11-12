const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../../bootstrap.test');

describe('controllers/vendors/fulfillmentprovider/FulfillmentTrigger', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    let a_provider;
    let a_transaction_product;
    let a_product;

    beforeEach((done) => { Promise.all([
        modelgenerator.randomEntityWithId('fulfillmentprovider').then(provider => { a_provider = provider}),
        modelgenerator.randomEntityWithId('components/transactionproduct').then(transaction_product => { a_transaction_product = transaction_product}),
        modelgenerator.randomEntityWithId('product').then(product => { a_product = product}),
    ]).then(() =>{
            done();
        }
    )});

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('getControllerInstance', () => {

        it('returns hashtag when needed', () => {

            a_provider.provider = 'HASHTAG';

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            expect(FulfillmentTrigger.getControllerInstance(a_provider)).to.be.defined;
        });

        it('throws error when provider is not supported', (done) => {

            a_provider.provider = 'UNSUPPORTED_PROVIDER';

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            try {
                FulfillmentTrigger.getControllerInstance(a_provider);
            } catch (error) {
                expect(error.message).to.equal('[501] Unknown fulfillment provider: UNSUPPORTED_PROVIDER');
                done();
                return;
            }

            done('Happy flow managed in try-catch block. This should fail.');
        });


    });

    describe('validateProvider', () => {

        it('calls the `testConnection` method from provider', () => {

            a_provider.provider = 'HASHTAG';
            const success_response = {message: 'success'};

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), {
                get: () => {
                    return Promise.resolve(a_provider);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/Hashtag/Hashtag.js'), {
                testConnection: () => {
                    return Promise.resolve(success_response);
                }
            });

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            return FulfillmentTrigger.validateProvider(a_provider).then(response => {
                expect(response.response).to.deep.equal(success_response);
            })
        });

    });

    describe('executeFulfillment', () => {

        it('calls the `triggerFulfillment` method from provider', () => {

            // prepare hydrated provider and transaction product
            a_provider.provider = 'HASHTAG';
            let hydrated_product = a_product;

            hydrated_product.fulfillment_provider = a_provider;
            a_transaction_product.product = hydrated_product;

            const success_response = {message: 'success'};

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), {
                get: () => {
                    return Promise.resolve(a_provider);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/Hashtag/Hashtag.js'), {
                triggerFulfillment: () => {
                    return Promise.resolve(success_response);
                }
            });

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            return FulfillmentTrigger.executeFulfillment(a_transaction_product).then(response => {
                expect(response).to.deep.equal(success_response);
            })
        });

        it('requires transaction product to be hydrated', (done) => {

            a_provider.provider = 'HASHTAG';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), {
                get: () => {
                    return Promise.resolve(a_provider);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/Hashtag/Hashtag.js'), {
                triggerFulfillment: () => {
                    return Promise.resolve();
                }
            });

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            FulfillmentTrigger.executeFulfillment(a_transaction_product)
            .then(() => {
                done('This should not have succeeded');
            })
            .catch(error => {
                expect(error.message).to.equal('[400] Unable to identify fulfillment provider associated with the transaction_product.');
                done();
            })


        });

    });

    describe('triggerFulfillment', () => {

        it('hydrates the provider and calls the `triggerFulfillment`', () => {

            // prepare hydrated provider and transaction product
            a_provider.provider = 'HASHTAG';
            let hydrated_product = a_product;

            a_transaction_product.product = hydrated_product;

            const success_response = {message: 'success'};

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/FulfillmentProvider.js'), {
                get: () => {
                    return Promise.resolve(a_provider);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/Hashtag/Hashtag.js'), {
                triggerFulfillment: () => {
                    return Promise.resolve(success_response);
                }
            });

            const FulfillmentTrigger = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js');

            return FulfillmentTrigger.triggerFulfillment(a_transaction_product).then(response => {
                expect(response).to.deep.equal(success_response);
            })
        });

    });



});
