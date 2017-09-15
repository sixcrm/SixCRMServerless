const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

require('../../../bootstrap.test');

describe('controllers/workers/pickRebill', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

	describe('pickRebill', function () {

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

	    it('returns true', function() {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                getRebillsAfterTimestamp: (time) => {
                    return Promise.resolve([]);
                },
                sendMessageAndMarkRebill: (rebill) => {
                    return Promise.resolve();
                }
            });

			let pickRebill = global.SixCRM.routes.include('controllers', 'workers/pickRebill.js');

			return pickRebill.pickRebill().then(response => expect(response).to.be.true);
		})
	});
});
