'use strict'
const redis = require('redis');
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

//Technical Debt: Finish this!
class RedisUtilities {

    constructor(){

    }

    //Technical Debt:  This throws uncatchable errors!  I'd prefer it to fail and disable it's usage.
    createClient(){

        du.debug('Create Client');

        if(!_.has(process.env, 'usecache') || (parseInt(process.env.usecache) < 1)){

            du.debug('Cache Disabled.  Skipping Redis instantiation.');
            return null;

        }else{

            du.debug('Cache Enabled -  Creating Redis Client...');

        }

        let configuration_object = {host: process.env.elasticache_endpoint, port: process.env.elasticache_port, retry_strategy: this.retryStrategy}

        du.debug('Redis Configuration: ', configuration_object);

        this.redis_client = redis.createClient(configuration_object)
        .on('connect', function() {
            du.debug('Redis connected.');
        })
        .on('ready', function() {
            du.debug('Redis ready.');
        })
        .on('end', function(){
            du.debug('Redis connection closed.');
        })
        .on('error', function(error){
            du.warning('Redis Error:', error);
        })
        .on('reconnecting', function(){
            du.debug('Redis reconnecting...')
        })
        .on('warning', function(warning){
            du.warning('Redis Warning: ', warning);
        });

        //this.setUnref();

    }

    setUnref(){

        du.debug('Set Unref');
        if(_.has(this, 'redis_client')){
            if(_.isFunction(this.redis_client.unref)){
                this.redis_client.unref();
            }
        }

    }

    get(key){

        du.debug('Get');

        return new Promise((resolve, reject) => {

            this.createClient();

            return this.redis_client.get(key, (error, reply) => {

                this.closeConnection();

                if(error){
                    return reject(error);
                }

                return resolve(reply);
            });

        });

    }

    set(key, value, expiration){

        this.setExpiration(key, expiration);

        if(_.isString(value)){

            return this.setString(key, value, expiration);

        }else if(_.isObject(value)){

            return this.setObject(key, value, expiration);

        }else{

            return Promise.reject(new Error('Redis: Unrecognized value type.'));

        }

    }

    closeConnection(){

        this.redis_client.quit();

    }

    //Technical Debt:  We should be setting the expiration on these things...
    setString(key, value, expiration){

        du.debug('Set String');

        return new Promise((resolve, reject) => {

            this.createClient();

            return this.redis_client.set(key, value, (error, reply) => {

                this.closeConnection();

                if(error){

                    return reject(error);
                }

                return resolve(reply);

            });

        });

    }

    //Technical Debt: Objects must be key value pairs where the value is also a string...
    //Technical Debt: Not tested, just stubbed.
    //Techincal Debt:  We should be setting the expiration here...
    setObject(key, value_object, expiration){

        du.debug('Set Object');

        return new Promise((resolve, reject) => {

            this.createClient();

            return this.redis_client.hmset(key, value_object, function (error, reply) {

                this.closeConnection();

                if(error){

                    return reject(error);
                }

                return resolve(reply);

            });

        });

    }

    setExpiration(key, expiration){

        du.debug('Set Expiration');

        if(!_.isUndefined(expiration)){
            du.debug('Key expiration: '+ expiration);
            this.redis_client.expire(key, expiration);
        }

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

module.exports = new RedisUtilities(process.env.stage);
