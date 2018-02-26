const chai = require('chai');
const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

describe('lib/redis-utilities', () => {
  let redisutilities = null;

  beforeEach(function () {
    redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
    redisutilities.redis = {
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
      let orig_create_config = redisutilities.redis.createClient;

      redisutilities.redis = {
        createClient(config) {
          expect(config.host).to.equal(redisutilities.endpoint);
          expect(config.port).to.equal(global.SixCRM.configuration.site_config.elasticache.port);
          expect(config.connect_timeout).to.be.a('number');
          expect(config.retry_strategy).to.be.a('function');
          return orig_create_config(config);
        }
      };
      redisutilities.connect();
    });
  });

  describe('quit', () => {
    it('properly quiting redis', () => {
      redisutilities.connect();
      return redisutilities.quit()
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.deep.equal(['quit'])
          return true;
        })
    });
  });

  describe('scheduleQuit', () => {
    it('properly scheduling immediately quiting redis', () => {
      redisutilities.connect();
      redisutilities.quiting_timer_timeout_ms = 0;
      return redisutilities.scheduleQuit()
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.not.deep.equal(['quit'])
          return true;
        })
        .then(timestamp.delay(10))
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.deep.equal(['quit'])
          return true;
        })
    });
    it('properly scheduling postponed quiting redis', () => {
      redisutilities.connect();
      redisutilities.quiting_timer_timeout_ms = 30;
      return redisutilities.scheduleQuit()
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.not.deep.equal(['quit'])
          return true;
        })
        .then(timestamp.delay(redisutilities.quiting_timer_timeout_ms / 2))
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.not.deep.equal(['quit'])
          return true;
        })
        .then(timestamp.delay(redisutilities.quiting_timer_timeout_ms))
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.deep.equal(['quit'])
          return true;
        })
    });
  });

  // describe('executeAndScheduleQuit', () => {
  //   it('properly scheduling immediately quiting redis', () => {
  //
  //   });
  // });

  describe('get', () => {
    it('properly called', () => {
      return redisutilities.get('abc')
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.deep.equal(['get', ['abc']]);
          return true;
        });
    });
  });

  describe('set', () => {
    it('properly called', () => {
      let value = {a: 123};

      return redisutilities.set('abc', value)
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.have.property(0).to.be.equal('set');
          expect(redisutilities.redis_client.recent_command).to.have.property(1).to.be.deep.equal(['abc', JSON.stringify(value), 'EX', redisutilities.default_expiration]);
          return true;
        });
    });
  });

  describe('flushAll', () => {
    it('properly called', () => {
      return redisutilities.flushAll()
        .then(() => {
          expect(redisutilities.redis_client.recent_command).to.be.deep.equal(['flushdb']);
          return true;
        });
    });
  });

  describe('getExpiration', () => {
    it('retrieves default expiration', () => {
      expect(redisutilities.getExpiration()).to.equal(global.SixCRM.configuration.site_config.elasticache.default_expiration);
    });
    it('throws invalid expiration error', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      try {
        redisutilities.getExpiration(-1)
      } catch (error) {
        expect(error.message).to.equal('[500] Invalid expiration.');
      }
    });
  });

  describe('prepareValue', () => {
    it('throws error when specified value is not a string or an object', () => {
      try {
        redisutilities.prepareValue(123)
      } catch (error) {
        expect(error.message).to.equal('[500] Value must be a string or an object');
      }
    });
    it('returns appointed object as string value', () => {
      expect(redisutilities.prepareValue({'test': 'sample_data'})).to.deep.equal('{"test":"sample_data"}');
    });
  });

  describe('retryStrategy', () => {
    it('properly configured max_attempts', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      expect(redisutilities.max_attempts).to.equal(global.SixCRM.configuration.site_config.elasticache.max_attempts);
      expect(redisutilities.max_attempts).to.be.at.least(2);
    });
    it('reconnects when there haven\'t been any errors and number of attempts is not exceeded', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
      let options = {attempt: redisutilities.max_attempts};

      expect(redisutilities.retryStrategy(options)).to.equal(Math.min(redisutilities.max_attempts * 100, 1000));
    });
    it('returns undefined when there have been more than 10 attempts', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
      let options = {attempt: redisutilities.max_attempts + 1};

      expect(redisutilities.retryStrategy(options)).to.equal(undefined);
    });
  });

});