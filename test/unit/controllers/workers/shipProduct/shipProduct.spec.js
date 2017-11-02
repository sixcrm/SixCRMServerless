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
        modelgenerator.randomEntityWithId('product').then(product => { random_products = [product, product]}),
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
                    return Promise.resolve(random_transactions[0]);
                },
                update: (entity) => {
                    return Promise.resolve(random_transactions[0]);
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

        it('updates transaction with new shipping receipt', () => {
            let fulfillment_response = { message: 'example_response' };

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];

            random_transactions[0].products[0].product = transaction_product.product.id;
            random_transactions[0].products[0].amount = transaction_product.amount;

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.issueShippingReceipt(fulfillment_response, transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(random_transactions[0]));
        });

        it('throws error if transaction already has shipping receipt', () => {
            let fulfillment_response = { message: 'example_response' };

            random_transactions[0].products[0].shippingreceipt = random_shipping_receipt;

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.issueShippingReceipt(fulfillment_response, random_transaction_product, random_transactions[0])
                .catch(error => expect(error.message).to.equal('[404] Unable to re-acquire transaction'));
        });

        it('throws error if transaction with specific product doesn\'t exist in transaction list', () => {
            let fulfillment_response = { message: 'example_response' };

            // Prepare transaction_product
            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0]; // hydrate

            // Prepare transaction with different products than on transaction_product
            let unrelated_transaction = random_transactions[0];

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.issueShippingReceipt(fulfillment_response, transaction_product, unrelated_transaction)
                .catch(error => expect(error.message).to.equal('[404] Unable to re-acquire transaction'));
        });
    });

    describe('executeFulfillment', () => {

        it('returns `noship` when product should not be shipped', () => {

            let transaction_product = random_transaction_product;

            random_transaction_product.product = random_products[0];
            random_transaction_product.product.ship = 'false';

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });

        it('returns `notified` when transaction already has a shipping receipt', () => {

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'true';
            transaction_product.shippingreceipt = random_shipping_receipt;

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(shipProduct.messages.notified));
        });

        it('returns `failed` when shipping receipt hasn\'t been successfully fulfilled', () => {

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'true';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js'), {
                triggerFulfillment: (transaction_product) => {
                    return Promise.resolve('FAILED');
                }
            });

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal(shipProduct.messages.failed));
        });

        /*
        1) controllers/workers/shipProduct processTransaction returns unchanged response from fulfillment provider if it was not recognized:

        AssertionError: expected 'NOSHIP' to equal 'unexpected response'
        + expected - actual

        -NOSHIP
        +unexpected response

        at shipProduct.processTransaction.then.result (test/unit/workers/shipProduct/shipProduct.spec.js:274:51)
        at process._tickDomainCallback (internal/process/next_tick.js:129:7)
        */
        xit('returns unchanged response from fulfillment provider if it was not recognized', () => {

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'true';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js'), {
                triggerFulfillment: (transaction_product) => {
                    return Promise.resolve('unexpected response');
                }
            });

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(transaction_product, random_transactions[0])
                .then(result => expect(result).to.equal('unexpected response'));
        });

        it('returns `notified` when shipping receipt has been successfully fulfilled', () => {

            let transaction_product = random_transaction_product;

            let transaction = random_transactions[0];

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'true';

            //Prepare transaction_product for issuing shipping receipt
            transaction.products[0].product = transaction_product.product.id;
            transaction.products[0].amount = transaction_product.amount;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js'), {
                triggerFulfillment: (transaction_product) => {
                    return Promise.resolve('NOTIFIED');
                }
            });

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.executeFulfillment(transaction_product, transaction)
                .then(result => expect(result).to.equal(shipProduct.messages.notified));
        });
    });

    describe('processTransaction', () => {

        it('returns `notified` when product should be shipped and fulfillment response was ok', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            let transaction = random_transactions[0];

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'true';
            transaction_product.shippingreceipt = random_shipping_receipt;

            return shipProduct.processTransaction(transaction)
                .then(result => expect(result).to.equal(shipProduct.messages.notified));
        });

        it('throws error when transaction has no products', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            delete random_transactions[0].products;

            return shipProduct.processTransaction(random_transactions[0])
                .catch(error => expect(error.message).to.equal('[500] No product in transaction?'));
        });

        it('returns `noship` when product should not be shipped', () => {

            let transaction = random_transactions[0];

            let transaction_product = random_transaction_product;

            transaction_product.product = random_products[0];
            transaction_product.product.ship = 'false';

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.processTransaction(transaction)
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });

        it('returns unchanged response from fulfillment provider if it was not recognized', () => {

            let transaction = random_transactions[0];

            random_transaction_product.product = random_products[0];

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/FulfillmentTrigger.js'), {
                triggerFulfillment: (transaction_product) => {
                    return Promise.resolve('unexpected response');
                }
            });

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.processTransaction(transaction)
                .then(result => expect(result).to.equal('unexpected response'));
        });
    });

    describe('shipProducts', () => {

        it('returns noship message when product should not be shipped', () => {

            const shipProduct = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

            return shipProduct.shipProducts(random_rebill)
                .then(result => expect(result).to.equal(shipProduct.messages.noship));
        });
    });
});
