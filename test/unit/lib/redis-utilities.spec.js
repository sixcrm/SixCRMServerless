const chai = require('chai');
const expect = chai.expect;

describe('lib/redis-utilities', () => {

    describe('closeConnection', () => {

        it('throws error when redis client is not set', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            try{
                redisutilities.closeConnection()
            }catch(error){
                expect(error.message).to.equal('[500] closeConnection assumes "this.redis_client" property to be set.');
            }
        });

        it('throws error when redis client does not have the quit function', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {'foo': 'bar'};

            try{
                redisutilities.closeConnection()
            }catch(error){
                expect(error.message).to.equal('[500] Redis client does not have the quit function.');
            }
        });
    });

    describe('getEndpoint', () => {

        it('retrieves endpoint', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            expect(redisutilities.getEndpoint()).to.equal(global.SixCRM.configuration.site_config.elasticache.endpoint);

        });

        it('returns null when endpoint is not set properly', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            delete redisutilities.endpoint;

            expect(redisutilities.getEndpoint()).to.equal(null);
        });
    });

    describe('createClient', () => {

        it('throws error when endpoint is not set', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            delete redisutilities.endpoint;

            try {
                redisutilities.createClient()
            }catch(error){
                expect(error.message).to.equal('[500] Unset Redis endpoint');
            }
        });
    });

    describe('prepare', () => {

        it('returns false when attempt limit has been exceeded', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            //any number higher than 3
            return redisutilities.prepare(4).catch((error) => {
                expect(error).to.be.false;
            });
        });

        it('returns true when redis client is ready', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.endpoint = global.SixCRM.configuration.site_config.elasticache.endpoint;
            redisutilities.redis_client.ready = true;

            //any number less than 4
            return redisutilities.prepare(3).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns null when client is not created and therefor not ready', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            //setting values this way will result in create client method to return null
            redisutilities.redis_client.ready = false;
            global.SixCRM.configuration.site_config.cache.usecache = 0;

            return redisutilities.prepare().catch((error) => {
                expect(error).to.equal(null);
            });
        });
    });

    describe('waitForClientReady', () => {

        it('returns true when redis client is ready', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client.ready = true;

            return redisutilities.waitForClientReady().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false when client is not ready and attempts exceeded maximum', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client.ready = false;

            //any number less than 21
            return redisutilities.waitForClientReady(20).catch((error) => {
                expect(error).to.equal(false);
            });
        });

        it('throws error when redis client is not set', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            delete redisutilities.redis_client;

            try {
                redisutilities.waitForClientReady()
            }catch(error){
                expect(error.message).to.equal('[500] waitForClientReady assumes that the redis_client property is set.');
            }
        });
    });

    describe('retryStrategy', () => {

        it('returns undefined when there have been more than 10 attempts', () => {

            let options = {attempt: 11};  //any number higher than 10

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            expect(redisutilities.retryStrategy(options)).to.equal(undefined);
        });

        it('reconnects when there haven\'t been any errors and number of attempts is not exceeded', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            expect(redisutilities.retryStrategy('a_params')).to.equal(10);
        });
    });

    describe('getExpiration', () => {

        it('retrieves default expiration', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            expect(redisutilities.getExpiration()).to.equal(global.SixCRM.configuration.site_config.elasticache.default_expiration);

        });

        it('throws invalid expiration error', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            try{
                //invalid expiration
                redisutilities.getExpiration(-1)
            }catch(error){
                expect(error.message).to.equal('[500] Invalid expiration.');
            }
        });
    });

    describe('prepareValue', () => {

        it('throws error when specified value is not a string or an object', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            try{
                //random non-string and non-object value
                redisutilities.prepareValue(123)
            }catch(error){
                expect(error.message).to.equal('[500] Value must be a string or an object');
            }
        });

        it('returns appointed object as string value', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            //random object value
            expect(redisutilities.prepareValue({'test': 'sample_data'})).to.deep.equal('{"test":"sample_data"}');
        });
    });

    describe('flushAll', () => {

        it('returns success when db has been cleared', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {
                ready: true,
                flushdb: (callback) => {
                    callback(null, 'success');
                },
                quit: () => {}
            };

            return redisutilities.flushAll().then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('get', () => {

        it('returns reply from redis get', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {
                ready: true,
                get: (key, callback) => {
                    callback(null, '{ "anyResult": "aResult"}');
                },
                quit: () => {}
            };

            return redisutilities.get('anyKey').then((result) => {
                expect(result).to.deep.equal({anyResult: 'aResult'});
            });
        });

        it('throws error from redis when data retrieval was unsuccessful', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {
                ready: true,
                get: (key, callback) => {
                    callback('fail', null);
                },
                quit: () => {}
            };

            return redisutilities.get('anyKey').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('set', () => {

        it('returns reply from redis set', () => {

            let anyResult = {anyResult: 'aResult'};

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {
                ready: true,
                set: (key, value, ex, expiration, callback) => {
                    callback(null, '{"anyResult": "aResult"}');
                },
                quit: () => {}
            };

            return redisutilities.set('anyKey', anyResult).then((result) => {
                expect(result).to.deep.equal(anyResult);
            });
        });

        it('throws error from redis when set was unsuccessful', () => {

            let anyResult = {anyResult: 'aResult'};

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client = {
                ready: true,
                set: (key, value, ex, expiration, callback) => {
                    callback('fail', null);
                },
                quit: () => {}
            };

            return redisutilities.set('anyKey', anyResult).catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });
});