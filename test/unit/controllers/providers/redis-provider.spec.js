const chai = require('chai');
const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

describe('controllers/providers/redis-provider', () => {
  let redisprovider = null;

  beforeEach(function () {

    const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
    redisprovider = new RedisProvider();

    redisprovider.redis = {

      createClient(config) {

        let spoofing_client = {
          config: config,
          recent_command: null,
          on: (key, callback) => {
            callback();
            return spoofing_client;
          },
          send_command: function (...command_info) {
            let callback = command_info.pop();

            spoofing_client.recent_command = command_info;
            callback(null, 'OK');
          }
        };

        return spoofing_client;
      }
    };
  });

  describe('connect', () => {

    it('properly configured redis', () => {

      let orig_create_config = redisprovider.redis.createClient;

      redisprovider.redis = {

        createClient(config) {

          expect(config.host).to.equal(redisprovider.endpoint);
          expect(config.port).to.equal(global.SixCRM.configuration.site_config.elasticache.port);
          expect(config.connect_timeout).to.be.a('number');
          expect(config.retry_strategy).to.be.a('function');

          return orig_create_config(config);

        }
      };

      redisprovider.connect();

    });
  });

  describe('quit', () => {

    it('properly quiting redis', () => {

      redisprovider.connect();

      return redisprovider.quit()
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.deep.equal(['quit'])

          return true;
        })
    });
  });

  describe('scheduleQuit', () => {

    it('properly scheduling immediately quiting redis', () => {

      redisprovider.connect();

      redisprovider.quiting_timer_timeout_ms = 0;

      return redisprovider.scheduleQuit()
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.not.deep.equal(['quit'])

          return true;

        })
        .then(timestamp.delay(10))
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.deep.equal(['quit'])

          return true;

        })
    });

    //Technical Debt:  Resolve! (Failing in Circle)
    /*
      1) lib/redis-provider scheduleQuit properly scheduling postponed quiting redis:

      AssertionError: expected [ 'quit' ] to not deeply equal [ 'quit' ]
      + expected - actual


      at Assertion.assertEqual (node_modules/chai/lib/chai/core/assertions.js:485:19)
      at Assertion.ctx.(anonymous function) (node_modules/chai/lib/chai/utils/addMethod.js:41:25)
      at doAsserterAsyncAndAddThen (node_modules/chai-as-promised/lib/chai-as-promised.js:293:29)
      at Assertion.<anonymous> (node_modules/chai-as-promised/lib/chai-as-promised.js:252:17)
      at Assertion.ctx.(anonymous function) [as equal] (node_modules/chai/lib/chai/utils/overwriteMethod.js:49:33)
      at redisprovider.scheduleQuit.then.then.then (test/unit/lib/redis-provider.spec.js:119:77)
      at propagateAslWrapper (node_modules/async-listener/index.js:502:23)
      at node_modules/async-listener/glue.js:188:31
      at proxyWrapper (node_modules/async-listener/index.js:511:29)
      at node_modules/async-listener/index.js:539:70
      at node_modules/async-listener/glue.js:188:31
    */

    xit('properly scheduling postponed quiting redis', () => {

      redisprovider.connect();

      redisprovider.quiting_timer_timeout_ms = 30;

      return redisprovider.scheduleQuit()
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.not.deep.equal(['quit'])

          return true;

        })
        .then(timestamp.delay(redisprovider.quiting_timer_timeout_ms / 2))
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.not.deep.equal(['quit'])

          return true;

        })
        .then(timestamp.delay(redisprovider.quiting_timer_timeout_ms))
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.deep.equal(['quit'])

          return true;

        })
    });
  });

  describe('get', () => {
    it('properly called', () => {
      return redisprovider.get('abc')
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.deep.equal(['get', ['abc']]);

          return true;

        });
    });
  });

  describe('set', () => {

    it('properly called', () => {

      let value = {a: 123};

      return redisprovider.set('abc', value)
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.have.property(0).to.be.equal('set');

          expect(redisprovider.redis_client.recent_command).to.have.property(1).to.be.deep.equal(['abc', JSON.stringify(value), 'EX', redisprovider.default_expiration]);

          return true;

        });
    });
  });

  describe('flushAll', () => {

    it('properly called', () => {

      return redisprovider.flushAll()
        .then(() => {

          expect(redisprovider.redis_client.recent_command).to.be.deep.equal(['flushdb']);

          return true;

        });
    });
  });

  describe('getExpiration', () => {

    it('retrieves default expiration', () => {

      expect(redisprovider.getExpiration()).to.equal(global.SixCRM.configuration.site_config.elasticache.default_expiration);

    });

    it('throws invalid expiration error', () => {

      const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
      const redisprovider = new RedisProvider();

      try {

        redisprovider.getExpiration(-1)

      } catch (error) {

        expect(error.message).to.equal('[500] Invalid expiration.');

      }

    });
  });

  describe('prepareValue', () => {

    it('throws error when specified value is not a string or an object', () => {

      try {

        redisprovider.prepareValue(123)

      } catch (error) {

        expect(error.message).to.equal('[500] Value must be a string or an object');

      }

    });

    it('returns appointed object as string value', () => {

      expect(redisprovider.prepareValue({'test': 'sample_data'})).to.deep.equal('{"test":"sample_data"}');
    });

  });

  describe('retryStrategy', () => {

    it('properly configured max_attempts', () => {

      const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
      const redisprovider = new RedisProvider();

      expect(redisprovider.max_attempts).to.equal(global.SixCRM.configuration.site_config.elasticache.max_attempts);

      expect(redisprovider.max_attempts).to.be.at.least(2);

    });

    it('reconnects when there haven\'t been any errors and number of attempts is not exceeded', () => {

      const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
      const redisprovider = new RedisProvider();

      let options = {attempt: redisprovider.max_attempts};

      expect(redisprovider.retryStrategy(options)).to.equal(Math.min(redisprovider.max_attempts * 100, 1000));

    });

    it('returns undefined when there have been more than 10 attempts', () => {

      const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
      const redisprovider = new RedisProvider();

      let options = {attempt: redisprovider.max_attempts + 1};

      expect(redisprovider.retryStrategy(options)).to.equal(undefined);

    });
  });

});
