const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/postback-utilities', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('executeRequest', () => {

        it('successfully executes get request', () => {

            let url = 'test';

            let response = 'success';

            mockery.registerMock('request', {
                get: (request_options, callback) => {
                    callback(null, response);
                }
            });

            const postbackutilities = global.SixCRM.routes.include('lib', 'postback-utilities.js');

            return postbackutilities.executeRequest(url).then((result) => {
                expect(result).to.equal(response);
            });
        });

        it('throws error when request is unsuccessfully executed', () => {

            let url = 'test';

            mockery.registerMock('request', {
                get: (request_options, callback) => {
                    callback('fail', null);
                }
            });

            const postbackutilities = global.SixCRM.routes.include('lib', 'postback-utilities.js');

            return postbackutilities.executeRequest(url).catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('executePostback', () => {

        it('successfully executes postback', () => {

            let url = 'test';

            let response = 'success';

            mockery.registerMock('request', {
                get: (request_options, callback) => {
                    callback(null, response);
                }
            });

            const postbackutilities = global.SixCRM.routes.include('lib', 'postback-utilities.js');

            return postbackutilities.executePostback(url).then((result) => {
                expect(result).to.equal(response);
            });
        });
    });
});