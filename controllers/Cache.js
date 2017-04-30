'use strict';
const _ = require('underscore');
const crypto = require('crypto');

const timestamp = require('../lib/timestamp.js');
const redisutilities = require('../lib/redis-utilities.js');
const du = require('../lib/debug-utilities.js');

class cacheController {

    constructor(prefix){

        if(_.isString(prefix)){
            this.prefix = prefix;
        }

    }

    //Technical Debt:  Refactor this this to be testable!
    useCache(parameters, data_promise, expiration){

        return this.validatePromise(data_promise).then((validated) => {

            du.info('Validated: ', validated);

            return this.createKey(parameters).then((key) => {

                du.info('Key: ', key);

                return this.getCache(key).then((cached_result) => {

                    du.info(cached_result);

                    if(!_.isNull(cached_result)){

                        return Promise.resolve(cached_result);

                    }

                    return data_promise.then((results) => {

                        du.info('Data Promise Result:', results);

                        return this.setCache(key, results, expiration);

                    });

                });

            });

        });

    }

    getCache(key){

        return redisutilities.get(key);

    }

    setCache(key, result, expiration){

        return redisutilities.set(key, result, expiration);

    }

    createKey(parameters){

        let prehash = parameters;

        if(_.isArray(parameters)){

            prehash = parameters.sort().join('');

        }else if(_.isString(parameters)){

            prehash = parameters.trim();

        }else if(_.isObject(parameters)){

            prehash = '';
            for (var k in parameters){
                if(parameters.hasOwnProperty(k)) {
                    prehash += k+parameters[k];
                }
            }

        }

        return Promise.resolve(crypto.createHash('sha1').update(prehash).digest('hex'));

    }

    validatePromise(data_promise){

        if(!_.isFunction(data_promise.then)){

            return Promise.reject(new Error('Callback_promise.then is not a function.'));

        }

        return Promise.resolve(true);

    }

}

module.exports = new cacheController();
