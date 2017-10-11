'use strict'
const _  = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class AWSUtilities {

    constructor(){

    }

    AWSCallback(error, data, fatal){

      du.deep('AWS Callback');

      if(error){

        eu.throwError('server', error);

      }

      return data;

    }

    tolerantCallback(error, data, fatal){

      du.deep('Tolerant Callback');

      fatal = (_.isUndefined(fatal))?true:fatal;

      if(error){
        if(fatal){
          eu.throwError('server', error);
        }

        return Promise.reject(error);

      }

      return Promise.resolve(data);

    }

}
