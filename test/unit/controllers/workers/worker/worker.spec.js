const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../bootstrap.test');

describe('controllers/workers/worker', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    const an_id = '7da91dc9-341b-4389-94ad-15b811996eef';

    describe('createForwardMessage', () => {


        it('creates message', () => {

            let worker = new workerController();

            return worker.createForwardMessage({id: an_id})
                .then(message => expect(message).to.deep.equal(`{"id":"${an_id}"}`));
        });

    });

    describe('parseInputEvent', () => {

        it('handles objects with id', () => {

            let object_with_id = {
                id: an_id
            };

            let worker = new workerController();

            return worker.parseInputEvent(object_with_id)
                .then(response => expect(response).to.deep.equal(an_id));
        });

        it('handles objects with Body', () => {

            let object_with_body = {
                Body: JSON.stringify({
                    id: an_id
                })
            };

            let worker = new workerController();

            return worker.parseInputEvent(object_with_body)
                .then(response => expect(response).to.deep.equal(an_id));
        });

        it('handles incorrect JSON in Body', () => {

            let object_with_body = {
                Body: {}
            };

            let worker = new workerController();

            return worker.parseInputEvent(object_with_body)
            .catch((response) => {
              expect(response.message).to.deep.equal('Unexpected token o in JSON at position 1')
            });
        });

        it('handles serialized objects', () => {

            let serialized_object = JSON.stringify({
                    id: an_id
                });

            let worker = new workerController();

            return worker.parseInputEvent(serialized_object)
                .then(response => expect(response).to.deep.equal(an_id));
        });

        it('handles incorrect JSON in object', () => {

            let object = 'incorrect_json';

            let worker = new workerController();

            return worker.parseInputEvent(object)
                .catch(response => expect(response.message).to.deep.equal('Unexpected token i in JSON at position 0'));
        });

        it('reports about unhandled format', () => {

            let object = 123;

            let worker = new workerController();

            return worker.parseInputEvent(object)
                .catch(response => expect(response.message).to.deep.equal('[500] Unrecognized event format: 123'));
        });

    });

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
