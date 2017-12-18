const chai = require('chai');
const expect = chai.expect;

const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

describe('config', () => {

    let stage;

    beforeEach(() => {
        stage = global.SixCRM.configuration.stage;
    });

    afterEach(() => {
        global.SixCRM.configuration.stage = stage;
    });

    describe('serverless', () => {

        it('should be valid', () => {

            let serverless_file = global.SixCRM.configuration.serverless_config;

            mvu.validateModel(serverless_file, global.SixCRM.routes.path('test', 'unit/config/serverless.json'))
        });

    });

    describe('site config', () => {

        let stages = [];

        for (let stage in global.SixCRM.configuration.stages) {
            stages.push(global.SixCRM.configuration.stages[stage]);
        }

        arrayutilities.map(stages, (stage) => {
            it('should be valid for ' + stage, () => {

                global.SixCRM.configuration.stage = stage;
                let site_config = global.SixCRM.configuration.getSiteConfig();

                mvu.validateModel(site_config, global.SixCRM.routes.path('test', 'unit/config/site_config.json'))
            });
        });


    });

});
