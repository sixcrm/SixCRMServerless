'use strict'
const redis = require('redis');
const _ = require('underscore');
const crypto = require('crypto');

const du = require('./debug-utilities.js');

//Technical Debt: Finish this!
class RedisUtilities {

    constructor(stage){

        if(stage == 'local'){

            du.debug('Elasticache is not available locally.');

            this.redis_client = null;

        }else{

            this.redis_client = redis.createClient({host: process.env.elasticache_endpoint});

        }

        this.default_expiration = 3600;

    }

    get(key){

      //Technical Debt:  This obviously does nothing.
        return Promise.resolve(null);

    }

    set(key, value, expiration){

        if(_.isUndefined(expiration)){
            expiration = this.default_expiration;
        }

      //Technical Debt:  This obviously does nothing.
        return Promise.resolve(value);

    }

}

module.exports = new RedisUtilities(process.env.stage);
