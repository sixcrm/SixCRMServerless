const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

require('../../../../bootstrap.test');

describe('controllers/workers/createRebills', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    describe('createForwardMessage', () => {

        it('creates message', () => {

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            return createRebills.createForwardMessage()
                .then(message => expect(message).to.deep.equal({message: "Rebills created.  Archive."}));
        });

    });

    describe('createRebills', () => {

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('returns appropriate message when no action was required', () => {

            let a_session = {}; // any session, doesn't matter

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                getProductSchedules: () => {
                    return Promise.resolve({}); // return whatever
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                createRebills: (session, schedules) => {
                    return Promise.resolve([]); // return empty list, so that 'no action is triggered'
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            return createRebills.createRebills(a_session)
                .then(message => expect(message).to.equal(createRebills.messages.successnoaction));
        });

        it('returns appropriate message when rebills were created', () => {

            let a_session = {}; // any session, doesn't matter

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                getProductSchedules: () => {
                    return Promise.resolve({}); // return whatever
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                createRebills: (session, schedules) => {
                    return Promise.resolve([{}]); // return one element in a list
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            return createRebills.createRebills(a_session)
                .then(message => expect(message).to.equal(createRebills.messages.success));
        });

        it('rejects promise when error happens while creating rebills', () => {

            let a_session = {}; // any session, doesn't matter

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                getProductSchedules: () => {
                    return Promise.resolve({}); // return whatever
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                createRebills: (session, schedules) => {
                    return Promise.reject(new Error('Error while creating rebills')); // return error
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            return createRebills.createRebills(a_session)
                .catch(error => expect(error.message).to.equal('Error while creating rebills'));
        });

        it('rejects promise when error happens while getting product schedules', () => {

            let a_session = {}; // any session, doesn't matter

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
                getProductSchedules: () => {
                    return Promise.reject(new Error('Error while getting product schedules')); // return error
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                createRebills: (session, schedules) => {
                    return Promise.resolve(); // return whatever
                }
            });

            let createRebills = global.SixCRM.routes.include('controllers', 'workers/createRebills.js');

            return createRebills.createRebills(a_session)
                .catch(error => expect(error.message).to.equal('Error while getting product schedules'));
        });

    });
});
