'use strict';
const _ = require('underscore');
const crypto = require('crypto');

const timestamp = require('../lib/timestamp.js');
const du = require('../lib/debug-utilities.js');
let redisutilities = require('../lib/redis-utilities.js');

class cacheController {

    constructor(prefix){

        if(_.isString(prefix)){
            this.key_prefix = prefix;
        }

    }

    //Technical Debt:  Refactor this this to be testable!
    //Technical Debt:  The data_promise variable is executed regardless of whether there are cached results or not.
    useCache(parameters, data_promise, expiration){

        du.debug('Use Cache');

        if(this.cacheActive()){

            return this.validatePromise(data_promise).then((validated) => {

                return this.createKey(parameters).then((key) => {

                    return this.getCache(key).then((cached_result) => {

                        if(!_.isNull(cached_result)){

                            du.warning('Redis Hit: '+ key);

                            cached_result = this.parseResult(cached_result);

                            return Promise.resolve(cached_result);

                        }

                        du.warning('Redis Miss: '+ key);

                        return data_promise().then((results) => {

                            du.info('Data Promise Result:', results);

                            return this.setCache(key, JSON.stringify(results), expiration).then((reply) => {

                                du.warning('Redis Set for key "'+key+'": '+reply);

                                return Promise.resolve(results);

                            });

                        });

                    });

                });

            });

        }else{

            return data_promise();

        }

    }

    parseResult(result){

        du.debug('Parse Result');

        try{

            let return_value = JSON.parse(result);

            return return_value;

        }catch(error){

            return result;

        }

    }

    getCache(key){

        du.debug('Get Cache');

        if(this.cacheActive()){

            return redisutilities.get(key);

        }

        return null;

    }

    setCache(key, result, expiration){

        du.debug('Set Cache');

        if(this.cacheActive()){
            return redisutilities.set(key, result, expiration);
        }

        return Promise.resolve('Cache Deactivated');

    }

    createKey(parameters){

        du.debug('Create Key');

        let prehash = parameters;

        if(_.isArray(parameters)){

            prehash = 'array'+parameters.sort().join(':');

        }else if(_.isString(parameters)){

            prehash = 'string'+parameters.trim();

        }else if(_.isObject(parameters)){

            prehash = 'object';
            for (var k in parameters){
                if(parameters.hasOwnProperty(k)) {
                    prehash += k+':'+parameters[k];
                }
            }

        }

        prehash = this.prependPrefix(prehash);

        prehash = this.appendCachebuster(prehash);

        return Promise.resolve(crypto.createHash('sha1').update(prehash).digest('hex'));

    }

    prependPrefix(prehash){

        du.debug('Prepend Prefix');

        if(_.has(this, 'key_prefix')){
            prehash = this.key_prefix+'-'+prehash;
        }

        return prehash;

    }

    appendCachebuster(prehash){

        du.debug('Append Cachebuster');

        if(_.has(process.env, 'cachebuster')){
            prehash = prehash+'-'+process.env.cachebuster;
        }

        return prehash;

    }

    validatePromise(data_promise){

        du.debug('Validate Promise');

        if(!_.isFunction(data_promise)){

            return Promise.reject(new Error('Callback_promise.then is not a function.'));

        }

        return Promise.resolve(true);

    }

    cacheActive(){

        du.debug('Cache Active');

        if(_.has(process.env, 'usecache') && parseInt(process.env.usecache) > 0){

            du.warning('Cache active.');

            return true;

        }

        du.warning('Cache not active.')

        return false;

    }

}

module.exports = new cacheController();
