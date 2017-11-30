const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

require('../../../../bootstrap.test');

function getValidRebill(){

    return {
        "id": "70de203e-f2fd-45d3-918b-460570338c9b",
        "bill_at": "2017-04-06T18:40:41.405Z",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "parentsession": "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
        "product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
        "amount": 79.99,
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    };

}

describe('controllers/workers/pickRebill', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

	describe('execute', function () {

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

	      it('does not process anything when no rebills are found', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                getRebillsAfterTimestamp: (time) => {
                    return Promise.resolve([]);
                },
                markRebillAsProcessing: (rebill) => {
                    expect.fail();
                    return Promise.resolve();
                }
            });

			      let pickRebill = global.SixCRM.routes.include('controllers', 'workers/pickRebill.js');

			      return pickRebill.execute();

		    });

        it('processes rebill', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                getRebillsAfterTimestamp: (time) => {
                    return Promise.resolve([getValidRebill()]);
                },
                markRebillAsProcessing: (rebill) => {
                    expect(rebill).to.deep.equal(getValidRebill());
                    return Promise.resolve();
                }
            });

			      let pickRebill = global.SixCRM.routes.include('controllers', 'workers/pickRebill.js');

			      return pickRebill.execute();

		    });
	});
});
