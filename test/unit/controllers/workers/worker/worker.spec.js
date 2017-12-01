const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../../bootstrap.test');

function getValidMessage(){
    return {
        MessageId: "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
        ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
        MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
        Body: JSON.stringify({id: uuidV4()})
    }
}

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

        it('returns rebill', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                get: (id) => {
                    return Promise.resolve(random_rebill);
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            let event = {id: an_id};

            createRebills.parameters.set('message', getValidMessage());

            return createRebills.acquireRebill(event).then(result => {
                expect(createRebills.parameters.store['rebill']).to.deep.equal(random_rebill);
                expect(result).to.be.true
            });
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

        it('returns session', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                get: (id) => {
                    return Promise.resolve(random_session);
                }
            });

            let createSessions = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            let event = {id: an_id};

            let message = getValidMessage();

            createSessions.parameters.set('message', message);

            return createSessions.acquireSession(event).then(result => {
                expect(createSessions.parameters.store['session']).to.deep.equal(random_session);
                expect(result).to.be.true
            });
        });

    });

});
