'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class RedisUtilities extends AWSUtilities{

    constructor(){

      super();

      this.setDefaultExpiration();

      this.setEndpoint();

    }

    setDefaultExpiration(){

      objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.elasticache.default_expiration', true);

      this.default_expiration = global.SixCRM.configuration.site_config.elasticache.default_expiration;

    }

    setEndpoint(endpoint){

      objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.elasticache.endpoint', true);

      this.endpoint = global.SixCRM.configuration.site_config.elasticache.endpoint;

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

        if(!objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.cache.usecache') || (parseInt(global.SixCRM.configuration.site_config.cache.usecache) < 1)){

            du.debug('Cache Disabled.  Skipping Redis instantiation.');

            return null;

        }else{

            du.debug('Cache Enabled -  Creating Redis Client...');

        }

        let endpoint = this.getEndpoint();

        if(_.isNull(endpoint)){
          eu.throwError('server', 'Unset Redis endpoint');
        }

        objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.elasticache.port', true);

        let configuration_object = {
          host: endpoint,
          port: global.SixCRM.configuration.site_config.elasticache.port,
          connect_timeout: 3600,
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
            du.deep(error);
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

        this.prepare().then(() => {

          if(_.has(this, 'redis_client')){

            this.redis_client.flushdb((error, succeeded) => {

              this.closeConnection();

              if(error){
                du.error(error)
                eu.throwError('server', error);
              }

              return resolve(succeeded);

            });

          }else{

            du.highlight('Redis client not available');

            return resolve(false);

          }

        });

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

        du.debug('Prepare');

        if(_.isUndefined(attempts)){
          attempts = 0;
        }

        return new Promise((resolve, reject) => {

          objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.elasticache.max_attempts', true);

          if(attempts > global.SixCRM.configuration.site_config.elasticache.max_attempts){

            du.warning('redisUtilities.prepare exhausted it\'s connection attempt limit.');

            return reject(false);

          }

          if(objectutilities.hasRecursive(this, 'redis_client.ready') && this.redis_client.ready == true){

            return resolve(true);

          }else{

            let create_result = this.createClient();

            if(_.isNull(create_result) || create_result == false){

              return reject(create_result);

            }else if(create_result == true){

              return resolve(true);

            }else{

              attempts = attempts+1;

              du.info('redisUtilities.prepare attempting to connect ('+numberutilities.appendOrdinalSuffix(attempts)+' attempt...)');

              return this.prepare(attempts);

            }

          }

        });

    }

    //Technical Debt:  Is this necessary?
    waitForClientReady(attempt){

      du.warning('Wait For Client Ready');

      if(_.isUndefined(attempt)){
        attempt = 0;
      }

      if(!_.has(this, 'redis_client')){
        eu.throwError('server', 'waitForClientReady assumes that the redis_client property is set.');
      }

      if(_.has(this.redis_client, 'ready') && this.redis_client.ready == true){

        return Promise.resolve(true);

      }

      if(attempt < 21){

        du.deep(this.redis_client);

        attempt++;

        du.info('Waiting for client to be ready ('+numberutilities.appendOrdinalSuffix(attempt)+' attempt...)');

        return timestamp.delay(2000)().then(() => {
          return this.waitForClientReady(attempt);
        })

      }

      return Promise.reject(false);

    }

    get(key){

      du.debug('Get');

      return new Promise((resolve, reject) => {

        return this.prepare().then(() => {

          this.redis_client.get(key, (error, reply) => {

            this.closeConnection();

            if(error){

              du.warning('Redis Get Error: ', error);

              return reject(error);

            }

            try{

              let parsed_reply = JSON.parse(reply);

              reply = parsed_reply;

            }catch(error){

              du.error(error);

              eu.throwError('server', error);

            }

            return resolve(reply);

          });

        });

      });

    }

    set(key, value, expiration){

      du.debug('Set');

      expiration = this.getExpiration(expiration);

      return new Promise((resolve, reject) => {

        this.prepare().then((result) => {

          value = this.prepareValue(value);

          this.redis_client.set(key, value, 'EX', expiration, (error, reply) => {

            this.closeConnection();

            if(error){

              du.warning('Redis Set Error: ', error);

              return reject(error);

            }

            try{

              let parsed_reply = JSON.parse(reply);

              reply = parsed_reply;

            }catch(error){

              //du.error(error);

              //return reject(error);

            }

            return resolve(reply);

          });

        });

      });

    }

    prepareValue(value){

      du.debug('Prepare Value');

      if(!_.isString(value) && !_.isObject(value)){

        eu.throwError('server', 'Value must be a string or an object');

      }

      if(_.isObject(value)){

        value = JSON.stringify(value);

      }

      return value;

    }

    closeConnection(){

        du.debug('Closing Connection');

        if(_.has(this, 'redis_client')){

            if(_.isFunction(this.redis_client.quit)){

                this.redis_client.quit();

            }else{

              eu.throwError('server', 'Redis client does not have the quit function.');

            }

            //delete this.redis_client;

        }else{

          eu.throwError('server', 'closeConnection assumes "this.redis_client" property to be set.');

        }

    }

    getExpiration(expiration){

        du.debug('Get Expiration');

        if(_.isUndefined(expiration)){

            if(_.has(this, 'default_expiration')){

                expiration = this.default_expiration;

            }

        }

        if(!numberutilities.isInteger(expiration) || expiration < 0){

            eu.throwError('validation','Invalid expiration.');

        }

        return expiration;

    }

    retryStrategy(options){

      du.info(options);

        du.debug('Retry Strategy');

        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }

        if (options.total_retry_time > 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }

        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after

        return 10;
        //return Math.min(options.attempt * 100, 3000);

    }

    /*
        this.connection_defaults = {
            retry_time: 360,
            max_attempts: 1,
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
    */
}

module.exports = new RedisUtilities();
