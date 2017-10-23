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

    beforeEach((done) => { Promise.all([
        modelgenerator.randomEntityWithId('fulfillmentprovider').then(provider => { a_provider = provider}),
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

    describe.only('getControllerInstance', () => {

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



});
