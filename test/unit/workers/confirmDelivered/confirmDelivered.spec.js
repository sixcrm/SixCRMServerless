const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../bootstrap.test');

describe('controllers/workers/confirmDelivered', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    let random_rebill;
    let random_transactions;
    let random_products;
    let random_transaction_product;
    let random_shipping_receipt;
    let example_usps_response = {
        parsed_status: 'example_usps_status'
    };

    beforeEach((done) => { Promise.all([
        modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill}),
        modelgenerator.randomEntityWithId('shippingreceipt').then(shipping_receipt => { random_shipping_receipt = shipping_receipt}),
        modelgenerator.randomEntityWithId('transaction').then(transaction => { random_transactions = [transaction]}),
        modelgenerator.randomEntityWithId('product').then(product => { random_products = [{product: product},{product: product}]}),
        modelgenerator.randomEntityWithId('transactionproduct').then(transaction_product => { random_transaction_product = transaction_product})
    ]).then(() =>{
            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                getTransactionProduct: (transaction) => {
                    return Promise.resolve(random_transaction_product);
                },
                get: (id) => {
                    return Promise.resolve(random_products[0].product);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/shippingproviders/ShippingStatus.js'), {
                getStatus: () => {
                    return Promise.resolve(example_usps_response);
                }
            });

            done();
        }
    )});

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe.only('confirmDelivered', () => {

        it('returns success message by default', () => {

            const confirmDelivered = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

            return confirmDelivered.confirmDelivered(random_rebill)
                .then(result => {
                    expect(result.message).to.equal(confirmDelivered.messages.delivered);
                    expect(result.forward.id).to.equal(random_rebill.id);

                });
        });

        it('returns parsed message from shipping provider status', () => {

            random_transaction_product.shippingreceipt = random_shipping_receipt;

            const confirmDelivered = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');



            return confirmDelivered.confirmDelivered(random_rebill)
                .then(result => expect(result.message).to.equal(example_usps_response.parsed_status));
        });


    });


});
