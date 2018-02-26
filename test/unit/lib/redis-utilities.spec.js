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


  describe('flushAll', () => {
    xit('returns success when db has been cleared', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {
        ready: true,
        flushdb: (callback) => {
          callback(null, 'success');
        },
        quit: () => {
        }
      }; // TODO: what is being tested here? a main logic is being substituted by mock.
      return redisutilities.flushAll().then((result) => {
        expect(result).to.equal('success');
        return true;
      });
    });
  });
  describe('get', () => {
    xit('returns reply from redis get', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {
        ready: true,
        get: (key, callback) => {
          callback(null, '{ "anyResult": "aResult"}');
        },
        quit: () => {
        }
      };
      return redisutilities.get('anyKey').then((result) => {
        expect(result).to.deep.equal({anyResult: 'aResult'});
        return true;
      });
    });
    xit('throws error from redis when data retrieval was unsuccessful', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {
        ready: true,
        get: (key, callback) => {
          callback('fail', null);
        },
        quit: () => {
        }
      };
      return redisutilities.get('anyKey').catch((error) => {
        expect(error).to.equal('fail');
      });
    });
  });
  describe('set', () => {
    xit('returns reply from redis set', () => {
      let anyResult = {anyResult: 'aResult'};
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {
        ready: true,
        set: (key, value, ex, expiration, callback) => {
          callback(null, '{"anyResult": "aResult"}');
        },
        quit: () => {
        }
      };
      return redisutilities.set('anyKey', anyResult).then((result) => {
        expect(result).to.deep.equal(anyResult);
        return true;
      });
    });
    xit('throws error from redis when set was unsuccessful', () => {
      let anyResult = {anyResult: 'aResult'};
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {
        ready: true,
        set: (key, value, ex, expiration, callback) => {
          callback('fail', null);
        },
        quit: () => {
        }
      };
      return redisutilities.set('anyKey', anyResult).catch((error) => {
        expect(error).to.equal('fail');
      });
    });
  });


  describe('closeConnection', () => {
    xit('throws error when redis client is not set', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      try {
        redisutilities.closeConnection()
      } catch (error) {
        expect(error.message).to.equal('[500] closeConnection assumes "this.redis_client" property to be set.');
      }
    });
    xit('throws error when redis client does not have the quit function', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client = {'foo': 'bar'};
      try {
        redisutilities.closeConnection()
      } catch (error) {
        expect(error.message).to.equal('[500] Redis client does not have the quit function.');
      }
    });
  });
  describe('getEndpoint', () => {
    xit('retrieves endpoint', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      expect(redisutilities.getEndpoint()).to.equal(global.SixCRM.configuration.site_config.elasticache.endpoint);
    });
    xit('returns null when endpoint is not set properly', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      delete redisutilities.endpoint;
      expect(redisutilities.getEndpoint()).to.equal(null);
    });
  });
  describe('createClient', () => {
    xit('throws error when endpoint is not set', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      delete redisutilities.endpoint;
      try {
        redisutilities.createClient()
      } catch (error) {
        expect(error.message).to.equal('[500] Unset Redis endpoint');
      }
    });
  });
  describe('prepare', () => {
    xit('returns false when attempt limit has been exceeded', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
      //any number higher than 3

      return redisutilities.prepare(4).catch((error) => {
        expect(error).to.be.false;
      });
    });
    xit('returns true when redis client is ready', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.endpoint = global.SixCRM.configuration.site_config.elasticache.endpoint;
      redisutilities.redis_client.ready = true;
      //any number less than 4
      return redisutilities.prepare(3).then((result) => {
        expect(result).to.be.true;
        return true;
      });
    });
    xit('returns null when client is not created and therefor not ready', () => {
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
    xit('returns true when redis client is ready', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client.ready = true; // TODO: What do we check?
      return redisutilities.waitForClientReady().then((result) => {
        expect(result).to.be.true;
        return true;
      });
    });
    xit('returns false when client is not ready and attempts exceeded maximum', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      redisutilities.redis_client.ready = false;
      //any number less than 21
      return redisutilities.waitForClientReady(20).catch((error) => {
        expect(error).to.equal(false);
      });
    });
    xit('throws error when redis client is not set', () => {
      const redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      delete redisutilities.redis_client;
      try {
        redisutilities.waitForClientReady()
      } catch (error) {
        expect(error.message).to.equal('[500] waitForClientReady assumes that the redis_client property is set.');
      }
    });
  });
});