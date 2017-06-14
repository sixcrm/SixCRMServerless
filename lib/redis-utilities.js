'use strict'
const _ = require('underscore');
const bluebird = require("bluebird");

const du = global.routes.include('lib', 'debug-utilities.js');
const mathutilities = global.routes.include('lib', 'math-utilities.js');

//Technical Debt: I hate prepare and close connection...

module.exports = class RedisUtilities {

    constructor(){

        this.setDefaultExpiration();

    }

    setDefaultExpiration(){

      //Technical Debt:  Add ability to set this in the site configuration yml
        this.default_expiration = 300;

    }

    //Technical Debt:  This throws uncatchable errors!  I'd prefer it to fail and disable it's usage.
    createClient(){

        this.redis = require('redis');

        //bluebird.promisifyAll(redis.RedisClient.prototype);
        //bluebird.promisifyAll(redis.Multi.prototype);

        du.debug('Create Client');

        if(!_.has(process.env, 'usecache') || (parseInt(process.env.usecache) < 1)){

            du.debug('Cache Disabled.  Skipping Redis instantiation.');

            return null;

        }else{

            du.debug('Cache Enabled -  Creating Redis Client...');

        }

        let configuration_object = {host: process.env.elasticache_endpoint, port: process.env.elasticache_port, retry_strategy: this.retryStrategy}

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



    }

    setUnref(){

        du.debug('Set Unref');

        if(_.has(this, 'redis_client')){

            if(_.isFunction(this.redis_client.unref)){

                this.redis_client.unref();

            }

        }

    }

    prepare(){

        du.debug('Is Ready');

        if(_.has(this, 'redis_client') && _.has(this.redis_client, 'ready') && this.redis_client.ready == true){

            return true;

        }else{

            return this.createClient();

        }

    }

    get(key){

        du.debug('Get');

        return new Promise((resolve, reject) => {

            this.prepare();

            this.redis_client.get(key, (error, reply) => {

                this.closeConnection();

                if(error){

                    du.warning('Redis Get Error: ', error);
                    return reject(error);

                }

           //du.warning('Redis Cache value: ', reply);
                return resolve(reply);

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

            throw new Error('Invalid expiration.');

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

            let error = new Error('The server refused the connection.');

            du.warning(error);
            return error;

        }

        if(
        (_.has(process.env, 'elasticache_retry_time') && options.total_retry_time > parseInt(process.env.elasticache_retry_time)) ||
        (!_.has(process.env, 'elasticache_retry_time') && options.total_retry_time > parseInt(this.connection_defaults.retry_time))
      ){

            let error = new Error('Retry time exhausted.');

            du.warning(error);
            return error;

        }

        if(
        (_.has(process.env, 'elasticache_max_attempts') && options.attempt > parseInt(process.env.elasticache_max_attempts)) ||
        (!_.has(process.env, 'elasticache_max_attempts') && options.attempt > parseInt(this.connection_defaults.max_attempts))
      ){

            let error = new Error('Maximum connection attempts exceeded.');

            du.warning(error);
            return error;

        }

        return Math.min((options.attempt * this.connection_defaults.attempt_backoff_scalar), this.connection_defaults.attempt_backoff_max);

    }

}
