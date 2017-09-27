const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../bootstrap.test');

describe('controllers/workers/archive', function () {

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

    beforeEach((done) => { Promise.all([
        modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill}),
        modelgenerator.randomEntityWithId('transaction').then(transaction => { random_transactions = [transaction]}),
        modelgenerator.randomEntityWithId('product').then(product => { random_products = [{product: product},{product: product}]})
    ]).then(() => done())});

    afterEach(() => {
        mockery.resetCache();
        delete process.env.archivefilter;
    });

    after(() => {
        mockery.deregisterAll();
    });

    const an_id = '7da91dc9-341b-4389-94ad-15b811996eef';

    describe('confirmSecondAttempt', () => {

        let random_rebill;

        beforeEach((done) => {
            modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill; done() })
        });

        it('determines second attempt', () => {

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            delete random_rebill.second_attempt;

            return archive.confirmSecondAttempt(random_rebill)
                .then(result => expect(result).to.equal(false));
        });

        it('determines second attempt (2)', () => {

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            random_rebill.second_attempt = true;

            return archive.confirmSecondAttempt(random_rebill)
                .then(result => expect(result).to.equal(true));
        });

    });

    describe('confirmNoShip', () => {

        it('rejects when listing transactions fails', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.reject(new Error('List failed.'));
                }
            });

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.confirmNoShip(random_rebill)
                .catch(result => expect(result.message).to.equal('List failed.'));
        });


        //Technical Debt:  Broken
        xit('returns true when no transaction has a product that is `ship`', () => {

            random_products[0].ship = true;
            random_products[1].ship = false;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                getProducts: (transaction) => {
                    return Promise.resolve(random_products);
                }
            });

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.confirmNoShip(random_rebill)
                .then(result => expect(result).to.equal(true));
        });

        //Technical Debt:  Breaking in Circle
        xit('returns false when no transaction has no products that are `ship`', () => {

            random_products[0].ship = false;
            random_products[1].ship = false;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                getProducts: (transaction) => {
                    return Promise.resolve(random_products);
                }
            });

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.confirmNoShip(random_rebill)
                .then(result => expect(result).to.equal(true));
        });


    });

    describe('archive', () => {

        let random_rebill;

        beforeEach((done) => { Promise.all([
            modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill}),
        ]).then(() => done())});

        it('returns success when archivefilter is not set', () => {

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.success));
        });

        it('returns error when archivefilter is not recognized', () => {

            process.env.archivefilter = 'invalid_filter';

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.archive(random_rebill)
                .catch(result => expect(result.message).to.equal('[501] Unrecognized archive filter: invalid_filter'));
        });

        it('returns success when archivefilter is set to `all`', () => {

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            process.env.archivefilter = archive.archivefilters.all;

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.success));
        });

        it('returns success when archivefilter is set to `noship` and noship is confirmed', () => {

            random_products[0].ship = true;
            random_products[1].ship = true;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                getProducts: (transaction) => {
                    return Promise.resolve(random_products);
                }
            });

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            process.env.archivefilter = archive.archivefilters.noship;

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.success));
        });

        //Technical Debt:  Broken
        xit('returns skip when archivefilter is set to `noship` and noship is not confirmed', () => {

            random_products[0].ship = false;
            random_products[1].ship = false;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
                getProducts: (transaction) => {
                    return Promise.resolve(random_products);
                }
            });

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            process.env.archivefilter = archive.archivefilters.noship;

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.skip));
        });

        it('returns success when archivefilter is set to `twoattempts` and second attempt is confirmed', () => {

            random_rebill.second_attempt = true;

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            process.env.archivefilter = archive.archivefilters.twoattempts;

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.success));
        });

        it('returns skip when archivefilter is set to `twoattempts` and second attempt is not confirmed', () => {

            delete random_rebill.second_attempt;

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            process.env.archivefilter = archive.archivefilters.twoattempts;

            return archive.archive(random_rebill)
                .then(result => expect(result).to.equal(archive.messages.skip));
        });


    });

    describe('createForwardObject', () => {

        it('creates', () => {

            const archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');

            return archive.createForwardObject()
                .then(result => expect(result).to.deep.equal({forward: true}));
        });

    });

});
