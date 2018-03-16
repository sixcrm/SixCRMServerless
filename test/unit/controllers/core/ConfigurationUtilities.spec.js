const chai = require('chai');
const expect = chai.expect;

describe('controllers/core/ConfigurationUtilities.js', () => {

    describe('determineStageFromAccountIdentifier', () => {

        let AWS_ACCOUNT;

        let context_temp;

        before(() => {
            context_temp = context;
            AWS_ACCOUNT = process.env.AWS_ACCOUNT;
        });

        after(() => {
            context = context_temp; //eslint-disable-line no-global-assign
            process.env.AWS_ACCOUNT = AWS_ACCOUNT;
        });

        it('throws error when account identifier returns unexpected value', () => {

            let aws_account = process.env.AWS_ACCOUNT;

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account'; //invalid aws account value

            try{
              configurationUtilities.determineStageFromAccountIdentifier();
            }catch (error) {
              expect(error.message).to.equal('[500] Unrecognized account identifier in stage.yml: ' + process.env.AWS_ACCOUNT);
            }
        });

        it('returns null when account identifier is undefined', () => {

            //remove any account identifier specification
            delete process.env.AWS_ACCOUNT;
            delete process.env.aws_account;
            delete context.invokedFunctionArn;

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.determineStageFromAccountIdentifier()).to.equal(null);
        });
    });

    describe('setStatus', () => {

        it('successfully initializes status', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.status).to.equal('loading');
        });

        it('throws error when status is unrecognized', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            try {
                configurationUtilities.setStatus('an_unexpected_value');
            } catch (error) {
                expect(error.message).to.equal('[500] Unrecognized status');
            }
        });
    });

    describe('evaluateStatus', () => {

        it('successfully evaluates status when configuration is set', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            //set necessary configuration fields
            configurationUtilities.environment_config = 'an_env_config';
            configurationUtilities.site_config = 'a_site_config';
            configurationUtilities.serverless_config = 'a_serverless_config';

            configurationUtilities.evaluateStatus();

            expect(configurationUtilities.status).to.equal('ready');
        });

        it('successfully evaluates status when configuration is not set', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            delete configurationUtilities.environment_config;
            delete configurationUtilities.site_config;
            delete configurationUtilities.serverless_config;

            configurationUtilities.evaluateStatus();

            expect(configurationUtilities.status).to.equal('loading');
        });
    });

    describe('getStatus', () => {

        it('successfully retrieves status', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            configurationUtilities.getStatus();

            expect(configurationUtilities.status).to.equal('loading');
        });

        it('throws error when status is not set', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            delete configurationUtilities.status;

            try {
                configurationUtilities.getStatus();
            } catch (error) {
                expect(error.message).to.equal('[500] Unset status variable.');
            }
        });
    });

    describe('setEnvironmentVariable', () => {

        it('successfully sets environment variable', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            configurationUtilities.setEnvironmentVariable('a_key', 'a_value');

            expect(process.env['a_key']).to.equal('a_value');
        });
    });

    describe('setField', () => {

        it('successfully sets field', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.setField('a_field')).to.equal('a_field');
        });

        it('successfully sets field to default value', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.setField()).to.equal('all');
        });

        it('throws error when specified field is not a string', () => {

            let fields = [123, 123.123, -123, -123.123, [], {}, () => {}, true];

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            fields.forEach(field => {
                try{
                    configurationUtilities.setField(field);
                } catch (error) {
                    expect(error.message).to.equal('[500] Configuration.setField assumes a string argument.');
                }
            });
        });
    });

    describe('setUseCache', () => {

        it('successfully sets use cache', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.setUseCache(false)).to.equal(false);
        });

        it('successfully sets use cache to default value', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.setUseCache()).to.equal(true);
        });

        it('throws error when specified use cache is not a boolean', () => {

            let fields = [123, 123.123, -123, -123.123, [], {}, () => {}, 'any_string', '123', 'any_string123', null];

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            fields.forEach(field => {
                try{
                    configurationUtilities.setUseCache(field);
                } catch (error) {
                    expect(error.message).to.equal('[500] Configuration.setUseCache assumes a boolean argument.');
                }
            });
        });
    });

    describe('setWaitFor', () => {

        it('successfully sets wait for', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            //valid value from configured stati
            expect(configurationUtilities.setWaitFor('loading')).to.equal('loading');
        });

        it('successfully sets wait for to default value', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.setWaitFor()).to.equal('ready');
        });

        it('throws error when specified wait for is not a null or a string', () => {

            let fields = ['any_string', '123', 'any_string123', 123, 123.123, -123, -123.123, [], {}, () => {}, true];

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            fields.forEach(field => {
                try{
                    configurationUtilities.setWaitFor(field);
                } catch (error) {
                    expect(error.message).to.equal('[500] Configuration.waitFor assumes a null or string valued ' +
                        'argument that matches stati definitions.');
                }
            });
        });
    });

    describe('buildLocalCacheKey', () => {

        it('successfully builds local cache key', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.buildLocalCacheKey('a_field'))
                .to.equal('global.SixCRM.configuration.environment_config.a_field');
        });
    });

    describe('buildRedisKey', () => {

        it('successfully builds redis key', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.buildRedisKey('a_field'))
                .to.equal('global.SixCRM.configuration.environment_config.a_field');
        });
    });

    describe('waitForStatus', () => {

        let test_mode;

        before(() => {
            test_mode = process.env.TEST_MODE;
            process.env.TEST_MODE = 'false';
        });

        after(() => {
            process.env.TEST_MODE = test_mode;
        });

        it('throws error when status is unrecognized', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            try{
                configurationUtilities.waitForStatus('an_unexpected_status');
            } catch (error) {
                expect(error.message).to.equal('[500] Unrecognized status');
            }
        });

        it('throws error when attempt count is less than 0', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            try{
                configurationUtilities.waitForStatus('loading', -1); //valid status any number less than 0
            } catch (error) {
                expect(error.message).to.equal('[500] Attempt count is improper');
            }
        });

        it('throws error when attempt count value is not an integer', () => {

            let attempt_count_values = ['any_string', '123', 'any_string123', [], {}, () => {}, -1.23, 1.23, null, false];

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            attempt_count_values.forEach(attempt_count => {
                try{
                    //valid status with unexpected attempt count value
                    configurationUtilities.waitForStatus('loading', attempt_count);
                } catch (error) {
                    expect(error.message).to.equal('[500] Attempt count is not an integer');
                }
            });
        });

        it('returns true when status value is valid', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            //valid status
            return configurationUtilities.waitForStatus('loading').then((result) => {
                expect(result).to.equal(true);
            });
        });

        it('throws error when maximum attempts are reached', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            //valid status and any number less than 200
            return configurationUtilities.waitForStatus('ready', 199).catch((error) => {
                expect(error.message).to.equal('[500] Maximum attempts exhausted.');
            });
        });
    });

    describe('resolveStage', () => {

        let stage;

        before(() => {
            stage = process.env.stage;
        });

        after(() => {
            process.env.stage = stage;
        });

        it('returns "local" when stage value is null', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            expect(configurationUtilities.resolveStage(null)).to.equal('local');
        });
    });

    describe('getAccountIdentifierFromEnvironment', () => {

        let AWS_ACCOUNT;

        let aws_account;

        before(() => {
            AWS_ACCOUNT = process.env.AWS_ACCOUNT;
            aws_account = process.env.aws_account;
        });

        after(() => {
            process.env.AWS_ACCOUNT = AWS_ACCOUNT;
            process.env.aws_account = aws_account;
        });

        it('successfully retrieves an account identifier "AWS_ACCOUNT" from environment', () => {

            let aws_account = process.env.AWS_ACCOUNT;

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account';

            expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.AWS_ACCOUNT);
        });

        it('successfully retrieves an account identifier "aws_account" from environment', () => {

            let aws_account = process.env.aws_account;

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            delete process.env.AWS_ACCOUNT;

            process.env.aws_account = aws_account ? aws_account : 'an_aws_account';

            expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(process.env.aws_account);
        });

        it('returns null when an account identifier from environment is undefined', () => {

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            delete process.env.AWS_ACCOUNT;
            delete process.env.aws_account;

            expect(configurationUtilities.getAccountIdentifierFromEnvironment()).to.equal(null);
        });
    });

    describe('getAccountIdentifier', () => {

        let AWS_ACCOUNT;

        let context_temp;

        before(() => {
            context_temp = context;
            AWS_ACCOUNT = process.env.AWS_ACCOUNT;
        });

        after(() => {
            context = context_temp; //eslint-disable-line no-global-assign
            process.env.AWS_ACCOUNT = AWS_ACCOUNT;
        });

        it('returns account identifier from environment', () => {

            let aws_account = process.env.AWS_ACCOUNT;

            const ConfigurationUtilities = global.SixCRM.routes.include('controllers','core/ConfigurationUtilities.js');
            let configurationUtilities = new ConfigurationUtilities();

            process.env.AWS_ACCOUNT = aws_account ? aws_account : 'an_aws_account';

            expect(configurationUtilities.getAccountIdentifier()).to.equal(process.env.AWS_ACCOUNT);
        });

    });
});
