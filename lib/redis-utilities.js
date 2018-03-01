'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

const {promisify} = require("es6-promisify");
const redis = require('redis');

class RedisUtilities {

  constructor() {
    this.default_expiration = objectutilities.getRecursive(global, 'SixCRM.configuration.site_config.elasticache.default_expiration', true);

    this.endpoint = objectutilities.getRecursive(global, 'SixCRM.configuration.site_config.elasticache.endpoint', true);
    if (!this.endpoint) {
      return eu.throwError('server', 'Redis endpoint is unset');
    }

    this.port = objectutilities.getRecursive(global, 'SixCRM.configuration.site_config.elasticache.port', true);
    this.redis = redis;
    this.max_attempts = objectutilities.getRecursive(global, 'SixCRM.configuration.site_config.elasticache.max_attempts', true);
    this.quiting_timer = null;
    this.quiting_timer_timeout_ms = 100;
  }

  connect() {
    if (!objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.cache.usecache') || (parseInt(global.SixCRM.configuration.site_config.cache.usecache) < 1)) {
      du.debug('Cache Disabled.  Skipping Redis instantiation.');

      return Promise.reject('Cache Disabled. Skipping Redis instantiation.');

    }
    du.debug('Cache Enabled - Creating Redis Client...');

    const configuration_object = {
      host: this.endpoint,
      port: this.port,
      connect_timeout: 3600,
      retry_strategy: this.retryStrategy
    };

    du.debug('Redis Configuration: ', configuration_object);

    this.when_redis_ready = new Promise((resolve, reject) => {

      this.redis_client = this.redis.createClient(configuration_object)
        .on('ready', () => {
          du.deep('Redis ready.');
          return resolve();
        })
        .on('error', (error) => {
          du.deep(error);
          return reject();
        })
        .on('connect', () => {
          du.deep('Redis connected.')
        })
        .on('end', () => {
          du.deep('Redis connection closed.')
        })
        .on('reconnecting', () => {
          du.deep('Redis reconnecting...')
        })
        .on('warning', (warning) => {
          du.warning('Redis Warning: ', warning)
        });

      this.redis_client_promisified = promisify(this.redis_client.send_command.bind(this.redis_client));

    });

    this.scheduleQuit();

    return this.when_redis_ready;
  }

  quit() {
    du.debug('Closing Connection');
    du.deep('redis-itils: quiting');

    let ret = Promise.resolve(true);

    if (this.redis_client_promisified) {

      ret = this.redis_client_promisified('quit'); // TODO: find out the way to determine quit executed

      this.redis_client_promisified = null;
    }
    return ret;
  }

  scheduleQuit() {
    if (this.quiting_timer) {
      clearTimeout(this.quiting_timer);
    }

    this.quiting_timer = setTimeout(() => {
      this.quit()
        .catch((error) => {
          du.error(error);

          eu.throwError('server', error);

        });
    }, this.quiting_timer_timeout_ms);

    return Promise.resolve();
  }

  executeAndScheduleQuit(promised_callback) {
    let queue = Promise.resolve();

    if (!this.redis_client_promisified) {
      queue = queue.then(() => {
        return this.connect();
      });
      du.deep('redis-utils: connected');
    }
    return queue
      .then(() => {
        du.deep('redis-utils: querying');

        if (!this.redis_client_promisified) {
          du.highlight('Redis client not available');
          return Promise.resolve(false);
        }

        return promised_callback()
          .catch((error) => {
            du.error(error);

            eu.throwError('server', error);

          });
      })
      .then((result) => {
        du.deep('redis-utils: scheduling quit');

        return this.scheduleQuit()
          .then(() => result);

      });
  }

  flushAll() {
    du.debug('Flush All');

    return this.executeAndScheduleQuit(() => {

      return this.redis_client_promisified('flushdb');

    });
  }

  get(key) {
    du.debug('Get');

    return this.executeAndScheduleQuit(() => {

      return this.redis_client_promisified("get", [key]);

    })
      .then(reply => {
        try {

          reply = JSON.parse(reply);

        } catch (error) {
          // Just tried to convert.
        }
        return reply;
      });
  }

  set(key, value, expiration) {
    du.debug('Set');

    value = this.prepareValue(value);
    expiration = this.getExpiration(expiration);

    return this.executeAndScheduleQuit(() => {

      return this.redis_client_promisified("set", [key, value, 'EX', expiration]);

    });
  }

  prepareValue(value) {
    du.debug('Prepare Value');

    if (!_.isString(value) && !_.isObject(value)) {
      eu.throwError('server', 'Value must be a string or an object');
    }

    if (_.isObject(value)) {
      value = JSON.stringify(value);
    }

    return value;
  }

  getExpiration(expiration) {
    du.debug('Get Expiration');

    if (_.isUndefined(expiration)) {
      if (!_.has(this, 'default_expiration')) {

        eu.throwError('validation', 'No default expiration set.');

      }

      expiration = this.default_expiration;

    }

    if (!numberutilities.isInteger(expiration) || expiration < 0) {

      eu.throwError('validation', 'Invalid expiration.');

    }

    return expiration;
  }

  retryStrategy(options) {

    du.info(options);

    du.debug('Retry Strategy');

    if (options.error && options.error.code === 'ECONNREFUSED') {

      return new Error('The server refused the connection');

    }

    if (options.total_retry_time > 60 * 60 * 1000) {

      return new Error('Retry time exhausted');

    }

    if (options.attempt > this.max_attempts) {

      return undefined;

    }

    return Math.min(options.attempt * 100, 1000);
  }

}

module.exports = new RedisUtilities();
