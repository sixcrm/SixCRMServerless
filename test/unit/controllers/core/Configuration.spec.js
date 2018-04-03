const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const _ = require('underscore');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
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

        //expect(configuration.stage).to.equal('local');
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

    describe('getAccountIdentifier', () => {

      let _context = null;
      let _process_env = null;

      before(() => {
        _process_env = process.env;
        _context = context;
      });

      after(() => {
        process.env = _process_env;
        /* eslint-disable no-global-assign */
        context = _context;
      });

      xit('determines account identifier', () => {
          let configuration = new Configuration('development');

          process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

          expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
      });

      xit('determines account identifier - fallback to lambda', () => {
          delete process.env.AWS_ACCOUNT;
          // eslint-disable-next-line no-global-assign
          context = {invokedFunctionArn: DEVELOPMENT_ACCOUNT};
          let configuration = new Configuration();

          expect(configuration.getAccountIdentifier()).to.equal(DEVELOPMENT_ACCOUNT);
      });

    });

    describe('determineStageFromAccountIdentifier', () => {

      let _process_env = null;

      before(() => {
        _process_env = process.env;
      });

      after(() => {
        process.env = _process_env;
      });

      xit('determines stage from account identifier', () => {
          let configuration = new Configuration();

          process.env.AWS_ACCOUNT = DEVELOPMENT_ACCOUNT;

          expect(configuration.determineStageFromAccountIdentifier()).to.equal('development');
      });

    });

    describe('getStatus', () => {

        xit('determines status', () => {

            let configuration = new Configuration();

            expect(configuration.getStatus()).to.equal('loading');

            configuration.setStatus('ready');

            expect(configuration.getStatus()).to.equal('ready');

        });

        xit('disallows setting incorrect status', () => {

            let configuration = new Configuration();

            expect(configuration.getStatus()).to.equal('loading');

            try {
                configuration.setStatus('incorrect_status');
            } catch (error) {
                expect(error.message).to.equal('[500] Unrecognized status');
            }

            expect(configuration.getStatus()).to.equal('loading');

        });

    });

    describe('setEnvironmentConfig', () => {

        it('sets environment config', () => {
            let configuration = new Configuration('local');

            return configuration.setEnvironmentConfig('test_key', 'test_value').then(() => {
                return configuration.getConfiguration('native', 'test_key', true).then((value) => {
                    expect(value).to.equal('test_value');
                })
            });
        });
    });

    describe('getEnvironmentConfig', () => {

        it('gets environment config when no value', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({
                        Body: JSON.stringify({})
                    });
                }
                putObject() {
                    return Promise.resolve();
                }
                hasCredentials() {
                  return true;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/redis-provider.js'), class {
                set() {
                    return Promise.resolve();
                }
                get() {
                    return Promise.resolve(null);
                }
            });

            let configuration = new Configuration('development');

            configuration.setEnvironmentConfigurationFile();

            expect(configuration.getEnvironmentConfig('non_exiting_key')).to.deep.equal({});
        });

        it('gets environment config when value exists', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({
                        Body: JSON.stringify({test_key: 'test_value'})
                    });
                }
                putObject() {
                    return Promise.resolve();
                }
                hasCredentials() {
                  return true;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/redis-provider.js'), class {
                set() {
                    return Promise.resolve();
                }
                get() {
                    return Promise.resolve(JSON.stringify({test_key: 'test_value'}));
                }
            });

            let configuration = new Configuration('development');

            configuration.setEnvironmentConfigurationFile();

            return configuration.getEnvironmentConfig('test_key').then((result) => {
                return expect(result).to.equal('test_value');
            })
        });
    });

    describe('getNativeEnvironmentConfiguration', () => {

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
    });

    describe('getLocalCacheEnvironmentConfiguration', () => {

        it('gets local environment config all', () => {

            let configuration = new Configuration();

            configuration.setEnvironmentConfigurationFile();

            configuration.environment_config = {test_key: 'test_value'};

            return configuration.getLocalCacheEnvironmentConfiguration('all').then((result) => {
              return expect(result).to.equal(configuration.environment_config);
            });

        });

    });

    describe('getS3EnvironmentConfiguration', () => {

        it('gets s3 config when value exists', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({
                        Body: JSON.stringify({test_key: 'test_value'})
                    });
                }
                putObject() {
                    return Promise.resolve();
                }
                hasCredentials() {
                  return true;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/redis-provider.js'), class {
                set() {
                    return Promise.resolve();
                }
                get() {
                    return Promise.resolve(JSON.stringify({}));
                }
            });

            let configuration = new Configuration('development');

            configuration.setEnvironmentConfigurationFile();

            return configuration.getS3EnvironmentConfiguration('test_key').then((result) => {
                return expect(result).to.equal('test_value');
            })
        });

        it('throws error when Body value is invalid', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({
                        Body: 'an_unexpected_value'
                    });
                }
                hasCredentials() {
                  return true;
                }
            });

            let configuration = new Configuration('development');

            return configuration.getS3EnvironmentConfiguration('test_key').catch((error) => {
                expect(error.message).to.equal('[500] Unexpected token a in JSON at position 0');
            })
        });

        it('throws error when Body property is missing', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({});
                }
                hasCredentials() {
                  return true;
                }
            });

            let configuration = new Configuration('local');

            return configuration.getS3EnvironmentConfiguration('test_key').catch((error) => {
                expect(error.message).to.equal('[500] Result response is assumed to have Body property');
            })
        });
    });

    describe('getRedisEnvironmentConfiguration', () => {

        it('gets redis config when value exists', () => {
            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
                objectExists() {
                    return Promise.resolve(true);
                }
                getObject() {
                    return Promise.resolve({
                        Body: JSON.stringify({})
                    });
                }
                putObject() {
                    return Promise.resolve();
                }
                hasCredentials() {
                  return true;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/redis-provider.js'), class {
                set() {
                    return Promise.resolve();
                }
                get() {
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

    describe('propagateToNativeCache', () => {

        it('sets environment config with specified values', () => {

            let configuration = new Configuration('local');

            return configuration.propagateToNativeCache('a_key', 'a_value').then((result) => {
                expect(configuration.environment_config).to.have.property('a_key');
                expect(configuration.environment_config.a_key).to.equal('a_value');
                expect(result).to.equal(true);
            })
        });

        it('removes environment config when specified "value" is null', () => {

            let configuration = new Configuration('local');

            configuration.environment_config = {};

            return configuration.propagateToNativeCache('a_key', null).then((result) => {
                expect(configuration.environment_config).to.be.undefined;
                expect(result).to.equal(true);
            })
        });

        it('removes environment config when specified "value" is null and "key" is valid', () => {

            let configuration = new Configuration('local');

            //valid key, null value
            return configuration.propagateToNativeCache('all', null).then((result) => {
                expect(configuration.environment_config).to.be.undefined;
                expect(result).to.equal(true);
            })
        });

        it('sets environment config to specified value', () => {

            let configuration = new Configuration('local');

            //valid key, random value
            return configuration.propagateToNativeCache('all', 'a_value').then((result) => {
                expect(configuration.environment_config).to.be.defined;
                expect(configuration.environment_config).to.equal('a_value');
                expect(result).to.equal(true);
            })
        });
    });

    it('gets s3 config when value exists', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
            objectExists() {
                return Promise.resolve(true);
            }
            getObject() {
                return Promise.resolve({
                    Body: JSON.stringify({test_key: 'test_value'})
                });
            }
            putObject() {
                return Promise.resolve();
            }
            hasCredentials() {
              return true;
            }
        });

        it('throws error when "source" is not a string', () => {

            let configuration = new Configuration('development');

            try {
                configuration.propagateCache(1, 'a_key', 'a_value')
            } catch(error) {
                expect(error.message).to.equal('[500] Source is assumed to be a string');
            }
        });

        it('throws error when source destination is invalid', () => {

            let configuration = new Configuration('development');

            try {
                configuration.propagateCache('an_unexpected_value', 'a_key', 'a_value')
            } catch(error) {
                expect(error.message).to.equal('[500] Unrecognized source destination');
            }
        });
    });

    it('gets redis config when value exists', () => {
        mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/s3-provider.js'), class {
            objectExists() {
                return Promise.resolve(true);
            }
            getObject() {
                return Promise.resolve({
                    Body: JSON.stringify({})
                });
            }
            putObject() {
                return Promise.resolve();
            }
            hasCredentials() {
              return true;
            }
        });

        it('throws error when "key" is not set', () => {

            let configuration = new Configuration('local');

            try {
                configuration.propagateToRedisCache()
            } catch(error) {
                expect(error.message).to.equal('[500] Key must be set');
            }
        });

        it('throws error when "value" is not set', () => {

            let configuration = new Configuration('local');

            try {
                configuration.propagateToRedisCache('a_key')
            } catch(error) {
                expect(error.message).to.equal('[500] Value must be set');
            }
        });
    });

    describe('getConfiguration', () => {

        it('throws error when "key" is not set', () => {

            let configuration = new Configuration('local');

            return configuration.getConfiguration('an_unexpected_source').catch((error) => {
                expect(error.message).to.equal('[500] Configuration.getConfiguration did not recognize the source ' +
                    'provided: "an_unexpected_source"');
            })
        });
    });

    describe('handleStage', () => {

      let process_env = null;

      before(() => {
        process_env = process.env;
      });

      afterEach(() => {
        process.env = process_env;
      })

      after(() => {
        process.env = process_env;
      });

      it('successfully identifies the stage based on branch name', () => {

        let stages = global.SixCRM.routes.include('config', 'stages.yml');

        objectutilities.map(stages, key => {

          let stage = stages[key];

          if(!_.isUndefined(process.env.AWS_ACCOUNT) && !_.isNull(process.env.AWS_ACCOUNT)){
            delete process.env.AWS_ACCOUNT;
          }

          if(!_.isUndefined(process.env.stage) && !_.isNull(process.env.stage)){
            delete process.env.stage;
          }

          process.env.CIRCLE_BRANCH = stage.branch_name;

          let configuration = new Configuration();

          expect(configuration.stage).to.equal(key);

        });

      });

      it('successfully identifies the stage (local) in absence of branch name or ', () => {

        //let stages = global.SixCRM.routes.include('config', 'stages.yml');

        if(!_.isUndefined(process.env.AWS_ACCOUNT) && !_.isNull(process.env.AWS_ACCOUNT)){
          delete process.env.AWS_ACCOUNT;
        }

        if(!_.isUndefined(process.env.stage) && !_.isNull(process.env.stage)){
          delete process.env.stage;
        }

        if(!_.isUndefined(process.env.CIRCLE_BRANCH) && !_.isNull(process.env.CIRCLE_BRANCH)){
          delete process.env.CIRCLE_BRANCH;
        }

        let configuration = new Configuration();

        expect(configuration.stage).to.equal('local');

      });

    });

});
