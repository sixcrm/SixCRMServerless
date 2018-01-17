'use strict'
const _  = require('underscore');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
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

    hasCredentials(fatal){

      du.deep('Has Credentials');

      fatal = (_.isUndefined(fatal))?true:fatal;

      //Technincal Debt:  What about STS?
      let required_credentials = ['AWS_ACCOUNT', 'AWS_REGION', 'AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'];

      let missing_credentials = arrayutilities.filter(required_credentials, required_credential => {
        return !_.has(process.env, required_credential);
      });

      if(arrayutilities.nonEmpty(missing_credentials)){

        if(fatal){
          eu.throwError('server', 'Missing Credentials: '+arrayutilities.compress(missing_credentials, ', ', ''));
        }

        du.warning('Missing Credentails: ', missing_credentials);

        return false;

      }

      return true;

    }

}
