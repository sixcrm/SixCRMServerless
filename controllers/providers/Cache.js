'use strict';
const _ = require('underscore');
const crypto = require('crypto');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class cacheController {

    constructor(prefix){

        if(_.isString(prefix)){
            this.key_prefix = prefix;
        }

        this.redisutilities =  global.SixCRM.routes.include('lib', 'redis-utilities.js');

    }

    //Technical Debt:  Refactor this this to be testable!
    //Technical Debt:  The data_promise variable is executed regardless of whether there are cached results or not.
    useCache(parameters, data_promise, expiration){

        du.debug('Use Cache');

        this.validatePromise(data_promise);

        if(this.cacheActive() && this.cacheEnabled()){

            let cache_key = this.createKey(parameters);

            return this.getCache(cache_key).then((cached_result) => {

                if(!_.isNull(cached_result)){

                    du.warning('Redis Hit: '+ cache_key);

                    cached_result = this.parseResult(cached_result);

                    du.deep('Cached Result', cached_result);

                    return Promise.resolve(cached_result);

                }else{

                    du.warning('Redis Miss: '+ cache_key);

                    return data_promise().then((results) => {

                        du.deep('Data Promise Result:', results);

                        return this.setCache(cache_key, JSON.stringify(results), expiration).then((reply) => {

                            du.warning('Redis Set for key "'+cache_key+'": '+reply);

                            return Promise.resolve(results);

                        });

                    });

                }

            });

        }else{

            return data_promise().then((results) => {

                if(this.cacheActive()){

                    return this.createKey(parameters).then((key) => {

                        return this.setCache(key, JSON.stringify(results), expiration).then((reply) => {

                            du.warning('Redis Set for key "'+key+'": '+reply);

                            return Promise.resolve(results);

                        });

                    });

                }else{

                    return Promise.resolve(results);

                }


            });

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

        return this.redisutilities.get(key);

    }

    setCache(key, result, expiration){

        du.debug('Set Cache');

        return this.redisutilities.set(key, result, expiration);

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

        return crypto.createHash('sha1').update(prehash).digest('hex');

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

            eu.throwError('server','Callback_promise.then is not a function.');

        }

        return true;

    }

    cacheActive(){

        du.debug('Cache Active');

        if(_.has(process.env, 'usecache') && parseInt(process.env.usecache) > 0){

            du.warning('Cache Active');

            return true;

        }

        du.warning('The cache is not active.  Please check serverless configuration.');

        return false;

    }

    setDisable(setting){

        du.debug('Set Disable');

        this.disable = setting;

    }

    cacheEnabled(){

        du.debug('Cache Enabled');

        if(_.has(this, 'disable') && this.disable === true){

            du.warning('Cache Disabled (Local Setting)');

            return false;

        }

        if(_.has(global, 'use_cache') && global.use_cache == false){

            du.warning('Cache Disabled (Global Setting)');

            return false;

        }

        return true;

    }

}
