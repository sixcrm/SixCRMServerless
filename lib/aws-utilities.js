'use strict'
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class AWSUtilities {

    constructor(){

    }

    AWSCallback(error, data){

      du.deep('AWS Callback');

      if(error){
        eu.throwError('server', error);
      }

      return data;

    }

}
