const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../../bootstrap.test');

describe('controllers/workers/confirmShipped', function () {

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

            done();
        }
    )});

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('confirmShipped', () => {

        it('returns success message when shipped', () => {

            delete random_products[0].product.ship;

            const confirmShipped = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

            return confirmShipped.confirmShipped(random_rebill)
                .then(result => expect(result).to.equal(confirmShipped.messages.shipped));
        });

        it('returns not ship message when missing shipping receipt', () => {

            random_products[0].product.ship = 'true';

            const confirmShipped = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

            return confirmShipped.confirmShipped(random_rebill)
                .then(result => expect(result).to.equal(confirmShipped.messages.notshipped));
        });

        it('returns ship message when shipping receipt is present', () => {

            random_products[0].product.ship = 'true';
            random_transaction_product.shippingreceipt = random_shipping_receipt;

            const confirmShipped = global.SixCRM.routes.include('controllers', 'workers/confirmShipped.js');

            return confirmShipped.confirmShipped(random_rebill)
                .then(result => expect(result).to.equal(confirmShipped.messages.shipped));
        });


    });


});
