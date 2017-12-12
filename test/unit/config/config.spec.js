const chai = require('chai');
const expect = chai.expect;

const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

describe.only('config', () => {

    describe('serverless', () => {

        it('should be valid', () => {

            let serverless_file = global.SixCRM.configuration.serverless_config;

            mvu.validateModel(serverless_file, global.SixCRM.routes.path('test', 'unit/config/serverless.json'))
        });

    });

});
