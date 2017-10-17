const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../bootstrap.test');

describe('controllers/workers/shipProduct', function () {

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

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ShippingReceipt.js'), {
                create: (input) => {
                    return Promise.resolve(input);
                },
                createShippingReceiptObject: (input) => {
                    let example_shipping_receipt = {
                        created: 1487768599196, // any timestamp
                        status: input.status
                    };

                    return Promise.resolve(example_shipping_receipt);
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

    describe('issueShippingReceipt', () => {

        xit('processes transaction with products', () => {

            let a_fulfillment_response = { message: 'example_response' };

            let updated_transaction;

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.issueShippingReceipt(a_fulfillment_response, random_transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(updated_transaction.noship));
        });


    });

    describe('executeFulfillment', () => {

        xit('processes transaction with products', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(random_transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });


    });

    describe('processTransaction', () => {

        xit('processes transaction with products', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.processTransaction(random_transactions[0])
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });

        xit('throws error when transaction has no products', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            delete random_transactions[0].products;

            return shipProduct.processTransaction(random_transactions[0])
                .catch(error => expect(error.message).to.equal('[500] No product in transaction?'));
        });

    });

    describe('shipProducts', () => {

        xit('returns noship message by default', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.shipProducts(random_rebill)
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });


    });


});
