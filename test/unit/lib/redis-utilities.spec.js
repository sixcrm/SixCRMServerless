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
    });

    describe('getEndpoint', () => {

        it('retrieves endpoint', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            expect(redisutilities.getEndpoint()).to.equal(global.SixCRM.configuration.site_config.elasticache.endpoint);

        });
    });

    describe('createClient', () => {

        it('returns true when client has been created', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis = {
                createClient: () => {
                    return {
                        on: (parameters, response) => {
                            response('connect');
                        }
                    }
                }
            };

            expect(redisutilities.createClient()).to.be.true;

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

            redisutilities.redis_client.ready = true;

            //any number less than 4
            return redisutilities.prepare(3).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns true when redis client is created', () => {

            const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

            redisutilities.redis_client.ready = false;  //set to false and then create client

            redisutilities.redis = {
                createClient: () => {
                    return {
                        on: (parameters, response) => {
                            response('connect');
                        }
                    }
                }
            };

            //any number less than 4
            return redisutilities.prepare(3).then((result) => {
                expect(result).to.be.true;
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
});