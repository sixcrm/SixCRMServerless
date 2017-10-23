const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/soap-utilities', () => {

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

    it('correctly passes wsdl', (done) => {

        let a_wsdl = null;

        const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');

        try {
            const soap = new SoapUtilities({wsdl: a_wsdl});
        } catch (error) {
            expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
            done();
            return;
        }

        done('Happy flow managed in try-catch block. This should fail.');
    });

    it('executes a correct method', (done) => {

        let a_wsdl = 'http://example.com';
        let a_method_name = 'testMethod';

        mockery.registerMock('soap', {
            createClientAsync: (wsdl) => {
                return Promise.resolve({
                    testMethodAsync: () => {
                        done();

                    }
                });
            }
        });
        const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');
        const soap = new SoapUtilities({wsdl: a_wsdl});

        soap.executeMethod({ name: a_method_name});
    });

    it('passes parameters to the method', (done) => {

        let a_wsdl = 'http://example.com';
        let a_method_name = 'testMethod';
        let the_parameters = {foo: 'bar', test: 'value'};

        mockery.registerMock('soap', {
            createClientAsync: (wsdl) => {
                return Promise.resolve({
                    testMethodAsync: (parameters) => {
                        expect(parameters).to.equal(the_parameters);
                        done();
                    }
                });
            }
        });
        const SoapUtilities = global.SixCRM.routes.include('lib', 'soap-utilities.js');
        const soap = new SoapUtilities({wsdl: a_wsdl});

        soap.executeMethod({ name: a_method_name, parameters: the_parameters });
    });
});