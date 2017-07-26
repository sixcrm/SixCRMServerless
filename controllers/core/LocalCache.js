'use strict'
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class LocalCache {

  constructor() {

    this.clear();

  }

  get(key){

    du.debug('Get');

    if(!_.isString(key)){
      eu.throwError('server', 'Key should be a string');
    }

    if(_.has(this.cache, key)){

      return this.cache[key];

    }

    return null;

  }

  set(key, value){

    du.debug('Set');

    if(!_.isString(key)){
      eu.throwError('server', 'Key should be a string');
    }

    if(_.has(this.cache, key) && _.isNull(value)){

      this.clear(key);

    }else{

      if(!_.isNull(value)){

        this.cache[key] = value;

      }

    }

    return true;

  }

  clear(key){

    du.debug('Clear');

    if(_.isUndefined(key)){
      key = 'all';
    }

    if(!_.isString(key)){
      eu.throwError('server', 'Key should be a string');
    }

    if(key == 'all'){
      this.cache = {};
    }else{
      delete this.cache[key];
    }

  }

}
