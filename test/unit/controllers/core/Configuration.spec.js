const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

const Configuration = global.SixCRM.routes.include('controllers','core/Configuration.js');

describe('controllers/core/Configuration.js', () => {

    const DEVELOPMENT_ACCOUNT = '068070110666';

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

    it('instantiates', () => {
        let configuration = new Configuration();

        let stage_names = [];

        for (let stage in configuration.stages) {
            stage_names.push(configuration.stages[stage]);
        }

        expect(stage_names).to.include.members(['development', 'staging', 'production']);
        expect(configuration.stage).to.equal('local');
        expect(configuration.serverless_config).not.to.be.undefined;
        expect(configuration.serverless_config).not.to.be.undefined;
        expect(configuration.environment_config).not.to.be.null;
        expect(configuration.environment_config).not.to.be.null;
        expect(configuration.site_config).not.to.be.undefined;
        expect(configuration.site_config).not.to.be.null;

    });

    it('handles incorrect stage', () => {
        try {
            new Configuration('some_unknown_stage');
        } catch (error) {
            expect(error.code).to.equal(500);
        }
    });

    it('determines account identifier', () => {
        let configuration = new Configuration('development');

        process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

        expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
    });

    it('determines stage from account identifier', () => {
        let configuration = new Configuration();

        process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

        expect(configuration.determineStageFromAccountIdentifier()).to.equal('development');
    });

    it('determines account identifier - fallback to lambda', () => {
        delete process.env.AWS_ACCOUNT;
        // eslint-disable-next-line no-global-assign
        context = { invokedFunctionArn: DEVELOPMENT_ACCOUNT };
        let configuration = new Configuration();

        expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
    });

    it('determines account identifier from lambda context', () => {
        // eslint-disable-next-line no-global-assign
        context = { invokedFunctionArn: DEVELOPMENT_ACCOUNT };
        let configuration = new Configuration();

        expect(configuration.getAccountIdentifierFromLambdaContext()).to.equal(DEVELOPMENT_ACCOUNT);
    });

    it('determines status', () => {
        let configuration = new Configuration();

        expect(configuration.getStatus()).to.equal('loading');

        configuration.setStatus('ready');

        expect(configuration.getStatus()).to.equal('ready');
    });

    it('disallows setting incorrect status', () => {
        let configuration = new Configuration();

        expect(configuration.getStatus()).to.equal('loading');

        try {
            configuration.setStatus('incorrect_status');
        } catch (error) {
            expect(error.message).to.equal('[500] Unrecognized status');
        }

        expect(configuration.getStatus()).to.equal('loading');
    });

    it('sets environment config', () => {
        let configuration = new Configuration('local');

        return configuration.setEnvironmentConfig('test_key', 'test_value').then(() => {
            return configuration.getConfiguration('native', 'test_key', true).then((value) => {
                expect(value).to.equal('test_value');
            })
        });
    });

    it('gets environment config when no value', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
            objectExists: (parameters) => {
                return Promise.resolve(true);
            },
            getObject: (parameters) => {
                return Promise.resolve({
                    Body: JSON.stringify({})
                });
            },
            putObject: (parameters) => {
                return Promise.resolve();
            },
        });

        mockery.registerMock(global.SixCRM.routes.path('lib', 'redis-utilities.js'), {
            set: (parameters) => {
                return Promise.resolve();
            },
            get: (parameters) => {
                return Promise.resolve(null);
            }
        });

        let configuration = new Configuration('development');

        configuration.setEnvironmentConfigurationFile();

        expect(configuration.getEnvironmentConfig('non_exiting_key')).to.deep.equal({});
    });

    it('gets environment config when value exists', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
            objectExists: (parameters) => {
                return Promise.resolve(true);
            },
            getObject: (parameters) => {
                return Promise.resolve({
                    Body: JSON.stringify({test_key: 'test_value'})
                });
            },
            putObject: (parameters) => {
                return Promise.resolve();
            },
        });

        mockery.registerMock(global.SixCRM.routes.path('lib', 'redis-utilities.js'), {
            set: (parameters) => {
                return Promise.resolve();
            },
            get: (parameters) => {
                return Promise.resolve(JSON.stringify({test_key: 'test_value'}));
            }
        });

        let configuration = new Configuration('development');

        configuration.setEnvironmentConfigurationFile();

        return configuration.getEnvironmentConfig('test_key').then((result) => {
            return expect(result).to.equal('test_value');
        })
    });

    it('gets native environment config', () => {

        let configuration = new Configuration();

        configuration.setEnvironmentConfigurationFile();

        configuration.environment_config = {test_key: 'test_value'};

        return configuration.getNativeEnvironmentConfiguration('test_key').then((result) => {
            return expect(result).to.equal('test_value');
        })
    });

    it('gets native environment config all', () => {

        let configuration = new Configuration();

        configuration.setEnvironmentConfigurationFile();

        configuration.environment_config = {test_key: 'test_value'};

        return configuration.getNativeEnvironmentConfiguration('all').then((result) => {
            return expect(result).to.equal(configuration.environment_config);
        })
    });

    it('gets local environment config all', () => {

        let configuration = new Configuration();

        configuration.setEnvironmentConfigurationFile();

        configuration.environment_config = {test_key: 'test_value'};

        return configuration.getLocalEnvironmentConfiguration('all').then((result) => {
            return expect(result).to.equal(configuration.environment_config);
        })
    });

    it('gets s3 config when value exists', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
            objectExists: (parameters) => {
                return Promise.resolve(true);
            },
            getObject: (parameters) => {
                return Promise.resolve({
                    Body: JSON.stringify({test_key: 'test_value'})
                });
            },
            putObject: (parameters) => {
                return Promise.resolve();
            },
        });

        mockery.registerMock(global.SixCRM.routes.path('lib', 'redis-utilities.js'), {
            set: (parameters) => {
                return Promise.resolve();
            },
            get: (parameters) => {
                return Promise.resolve(JSON.stringify({}));
            }
        });

        let configuration = new Configuration('development');

        configuration.setEnvironmentConfigurationFile();

        return configuration.getS3EnvironmentConfiguration('test_key').then((result) => {
            return expect(result).to.equal('test_value');
        })
    });

    it('gets redis config when value exists', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
            objectExists: (parameters) => {
                return Promise.resolve(true);
            },
            getObject: (parameters) => {
                return Promise.resolve({
                    Body: JSON.stringify({})
                });
            },
            putObject: (parameters) => {
                return Promise.resolve();
            },
        });

        mockery.registerMock(global.SixCRM.routes.path('lib', 'redis-utilities.js'), {
            set: (parameters) => {
                return Promise.resolve();
            },
            get: (parameters) => {
                return Promise.resolve(JSON.stringify({test_key: 'test_value'}));
            }
        });

        let configuration = new Configuration('development');

        configuration.setEnvironmentConfigurationFile();

        return configuration.getRedisEnvironmentConfiguration('test_key').then((result) => {
            return expect(result).to.equal('{"test_key":"test_value"}');
        })
    });

});
