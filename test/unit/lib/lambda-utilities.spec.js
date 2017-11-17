const chai = require('chai');
const expect = chai.expect;

describe('lib/lambda-utilities', () => {

    describe('buildLambdaName', () => {

        it('returns lambda name', () => {
            const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

            expect(lambdautilities.buildLambdaName('a_lambda_name')).to.equal(
                global.SixCRM.configuration.serverless_config.service +
                '-' + process.env.stage +
                '-a_lambda_name');
        });
    });

    describe('buildHandlerFunctionName', () => {

        it('build handler function name', () => {
            const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

            expect(lambdautilities.buildHandlerFunctionName('sixcrm-stagename-name')).to.equal('name');
        });
    });

    describe('invokeFunction', () => {

        it('invokes function', () => {
            const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

            lambdautilities.require_local = false;

            lambdautilities.lambda = {
                invoke: function(params, callback) {
                    callback(null, 'success');
                }
            };

            return lambdautilities.invokeFunction({
                function_name: 'a_function_name',
                payload: 'a_payload'
            }).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from lambda invoke', () => {
            const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

            lambdautilities.require_local = false;

            lambdautilities.lambda = {
                invoke: function(params, callback) {
                    callback('fail', null);
                }
            };

            return lambdautilities.invokeFunction({
                function_name: 'a_function_name',
                payload: 'a_payload'
            }).catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });
});