const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/http-provider', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('removeIrrelevantFields', () => {

        it('removes irrelevant fields', () => {

            let response = {
                statusCode: 200,
                statusMessage: 'OK',
                body: 'Success'
            };

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            let result = httpprovider.removeIrrelevantFields(response);

            expect(result).to.have.property('statusCode');
            expect(result).to.have.property('statusMessage');
            expect(result).to.have.property('statusCode');
        });
    });

    describe('createQueryString', () => {

        it('creates query string', () => {

            let response = {
                a_query_string: 'test123'
            };

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            expect(httpprovider.createQueryString(response)).to.equal('a_query_string=test123')
        });
    });

    describe('resolveRequest', () => {

        it('successfully resolves request', () => {

            let response_object = {
                error: null,
                response: 'a_response',
                body: {}
            };

            mockery.registerMock('request', (request_options, callback) => {
                return callback(response_object.error, response_object.response, response_object.body);
            });

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            return httpprovider.resolveRequest().then((result) => {
                expect(result).to.deep.equal(response_object);
            });
        });

        it('throws error when request was not resolved', () => {

            let response_object = {
                error: new Error('fail'),
                response: 'failed',
                body: {}
            };

            mockery.registerMock('request', (request_options, callback) => {
                return callback(response_object.error, response_object.response, response_object.body);
            });

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            return httpprovider.resolveRequest().catch((error) => {
                expect(error.message).to.equal();
            });
        });
    });

    describe('getJSON', () => {

        it('successfully retrieves JSON', () => {

            let response_object = {
                error: null,
                response: 'a_response',
                body: {}
            };

            mockery.registerMock('request', (request_options, callback) => {
                expect(request_options).to.have.property('method');
                expect(request_options.method).to.equal('get');
                expect(request_options).to.have.property('json');
                expect(request_options.json).to.equal(true);
                return callback(response_object.error, response_object.response, response_object.body);
            });

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            return httpprovider.getJSON({}).then((result) => {
                expect(result).to.deep.equal(response_object);
            });
        });
    });

    describe('postJSON', () => {

        it('successfully creates JSON', () => {

            let response_object = {
                error: null,
                response: 'a_response',
                body: {}
            };

            mockery.registerMock('request', (request_options, callback) => {
                expect(request_options).to.have.property('method');
                expect(request_options.method).to.equal('post');
                expect(request_options).to.have.property('json');
                expect(request_options.json).to.equal(true);
                expect(request_options).to.have.property('headers');
                expect(request_options.headers['Content-Type']).to.equal('application/json');
                return callback(response_object.error, response_object.response, response_object.body);
            });

            const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
            const httpprovider = new HttpProvider();

            return httpprovider.postJSON({}).then((result) => {
                expect(result).to.deep.equal(response_object);
            });
        });
    });
});
