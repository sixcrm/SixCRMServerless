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
