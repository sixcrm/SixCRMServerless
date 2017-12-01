const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../../bootstrap.test');

describe('controllers/workers/worker', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    const an_id = '7da91dc9-341b-4389-94ad-15b811996eef';

    describe('acquireRebill', () => {

        let random_rebill;

        beforeEach((done) => {
            modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill; done() })
        });

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        xit('returns rebill', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                get: (id) => {
                    return Promise.resolve(random_rebill);
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
            let event = {id: an_id};

            return createRebills.acquireRebill(event)
                .then(message => expect(message).to.deep.equal(random_rebill));
        });

    });

    describe('acquireSession', () => {

        let random_session;

        beforeEach((done) => {
            modelgenerator.randomEntityWithId('session').then(session => { random_session = session; done() })
        });

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        xit('returns session', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                get: (id) => {
                    return Promise.resolve(random_session);
                }
            });

            let createSessions = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');
            let event = {id: an_id};

            return createSessions.acquireSession(event)
                .then(message => expect(message).to.deep.equal(random_session));
        });

    });

});
