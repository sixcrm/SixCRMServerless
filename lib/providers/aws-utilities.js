'use strict'
const _  = require('underscore');
//const AWSXRay = require('aws-xray-sdk');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class AWSUtilities {

    constructor(){

    }

    instantiateAWS(){

      du.deep('Instantiate AWS');

      if(!_.has(this, 'AWS')){
        this.AWS = require('aws-sdk');
      }

    }

    getRegion(){

      du.deep('Get Region');

      return global.SixCRM.configuration.site_config.aws.region;

    }

    AWSCallback(error, data){

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

    hasCredentials(fatal){

      du.deep('Has Credentials');

      fatal = (_.isUndefined(fatal))?true:fatal;

      let validation = mvu.validateModel(process.env, global.SixCRM.routes.path('model','general/process_env/hasawscredentials.json'), null, false)

      if(!validation){

        if(fatal){
          eu.throwError('server', 'Missing Credentials in process.env');
        }

        du.warning('Missing Credentials in process.env');

        return false;

      }

      return true;

    }

}
