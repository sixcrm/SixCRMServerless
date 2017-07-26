'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class RedisUtilities extends AWSUtilities{

    constructor(){

      super();

      this.setDefaultExpiration();

    }

    setDefaultExpiration(){

      this.default_expiration = global.SixCRM.configuration.site_config.elasticache.default_expiration;

    }

    setEndpoint(endpoint){

      //use a private variable
      this.endpoint = endpoint;

    }

    getEndpoint(){

      if(_.has(this, 'endpoint')){

        return this.endpoint;

      }

      return null;

    }

    //Technical Debt:  This throws uncatchable errors!  I'd prefer it to fail and disable it's usage.
    createClient(){

        this.redis = require('redis');

        du.debug('Create Client');

        if(!_.has(global.SixCRM.configuration.site_config.cache, 'usecache') || (parseInt(global.SixCRM.configuration.site_config.cache.usecache) < 1)){

            du.debug('Cache Disabled.  Skipping Redis instantiation.');

            return null;

        }else{

            du.debug('Cache Enabled -  Creating Redis Client...');

        }

        let endpoint = this.getEndpoint();

        if(_.isNull(endpoint)){
          eu.throwError('server', 'Unset Redis endpoint');
        }

        let configuration_object = {
          host: endpoint,
          port: global.SixCRM.configuration.site_config.elasticache.port,
          retry_strategy: this.retryStrategy
        }

        du.debug('Redis Configuration: ', configuration_object);

        let redis_client = this.redis.createClient(configuration_object)
        .on('connect', function() {
            du.deep('Redis connected.');
        })
        .on('ready', function() {
            du.deep('Redis ready.');
        })
        .on('end', function(){
            du.deep('Redis connection closed.');
        })
        .on('error', function(error){
            du.warning(error);
            throw error;
        })
        .on('reconnecting', function(){
            du.deep('Redis reconnecting...')
        })
        .on('warning', function(warning){
            du.warning('Redis Warning: ', warning);
        });

        this.redis_client = redis_client;

        return true;

    }

    flushAll(){

      du.debug('Flush All');

      return new Promise((resolve) => {

        this.prepare();

        if(_.has(this, 'redis_client')){

            this.redis_client.flushdb((error, succeeded) => {

              this.closeConnection();

              if(error){
                eu.throwError('server', error);
              }

              return resolve(succeeded);

            });

        }else{

          du.highlight('Redis client not available');

          return resolve(false);

        }

      });


    }

    setUnref(){

        du.debug('Set Unref');

        if(_.has(this, 'redis_client')){

            if(_.isFunction(this.redis_client.unref)){

                this.redis_client.unref();

            }

        }

    }

    prepare(attempts){

        du.debug('Is Ready');

        if(_.isUndefined(attempts)){
          attempts = 0;
        }

        if(attempts > global.SixCRM.configuration.site_config.elasticache.max_attempts){

          return false;

        }

        if(_.has(this, 'redis_client') && _.has(this.redis_client, 'ready') && this.redis_client.ready == true){

            return true;

        }else{

            let create_result = this.createClient();

            if(_.isNull(create_result) || create_result == false){

              return create_result;

            }else if(create_result == true){

              return true;

            }else{

              attempts = attempts+1;

              return this.prepare(attempts);

            }

        }

    }

    get(key){

        du.debug('Get');

        return new Promise((resolve, reject) => {

          global.SixCRM.configuration.waitForStatus('ready')
          .then(global.SixCRM.configuration.getEnvironmentConfig('elasticache_endpoint'))
          .then((result) => {

            if(_.isNull(result)){ return resolve(null); }

            this.setEndpoint(result);

            this.prepare();

            this.redis_client.get(key, (error, reply) => {

              this.closeConnection();

              if(error){

                  du.warning('Redis Get Error: ', error);
                  return reject(error);

              }

              return resolve(reply);

            });


          });

        });

    }

    set(key, value, expiration){

        du.debug('Set');

        if(_.isString(value)){

            return this.setString(key, value, expiration);

        }else if(_.isObject(value)){

            return this.setObject(key, value, expiration);

        }

    }

    closeConnection(){

        du.warning('Closing Connection');

        this.redis_client.quit();

    }

    setString(key, value, expiration){

        du.debug('Set String');

        expiration = this.getExpiration(expiration);

        this.prepare();

        let response = this.redis_client.set(key, value, 'EX', expiration);

        this.closeConnection();

        return Promise.resolve(response);

    }

    //Technical Debt: Objects must be key value pairs where the value is also a string...
    //Technical Debt: Not tested, just stubbed.
    setObject(key, value_object, expiration){

        du.debug('Set Object');

        expiration = this.getExpiration(expiration);

        this.prepare();

        let response = this.redis_client.hmset(key, value_object, 'EX', expiration);

        this.closeConnection();

        return Promise.resolve(response);

    }

    getExpiration(expiration){

        du.debug('Get Expiration');

        if(_.isUndefined(expiration)){

            if(_.has(this, 'default_expiration')){

                expiration = this.default_expiration;

            }

        }

        if(!mathutilities.isInteger(expiration) || expiration < 0){

            eu.throwError('validation','Invalid expiration.');

        }

        return expiration;

    }

    retryStrategy(options){

        du.debug('Retry Strategy');

        this.connection_defaults = {
            retry_time: 3600000,
            max_attempts: 10,
            attempt_backoff_scalar: 1000,
            attempt_backoff_max: 3000
        };

        if(options.error && options.error.code === 'ECONNREFUSED') {

            let error = eu.getError('server','The server refused the connection.');

            du.warning(error);
            return error;

        }

        if(
        (_.has(global.SixCRM.configuration.site_config.elasticache, 'retry_time') && options.total_retry_time > parseInt(global.SixCRM.configuration.site_config.elasticache.retry_time)) ||
        (!_.has(global.SixCRM.configuration.site_config.elasticache, 'retry_time') && options.total_retry_time > parseInt(this.connection_defaults.retry_time))
      ){

            let error = eu.getError('server','Retry time exhausted.');

            du.warning(error);
            return error;

        }

        if(
        (_.has(global.SixCRM.configuration.site_config.elasticache, 'max_attempts') && options.attempt > parseInt(global.SixCRM.configuration.site_config.elasticache.max_attempts)) ||
        (!_.has(global.SixCRM.configuration.site_config.elasticache, 'max_attempts') && options.attempt > parseInt(this.connection_defaults.max_attempts))
      ){

            let error = eu.getError('server','Maximum connection attempts exceeded.');

            du.warning(error);
            return error;

        }

        return Math.min((options.attempt * this.connection_defaults.attempt_backoff_scalar), this.connection_defaults.attempt_backoff_max);

    }

}

module.exports = new RedisUtilities();
