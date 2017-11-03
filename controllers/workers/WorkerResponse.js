'use strict'
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const ResponseController = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class WorkerResponse extends Worker{

  constructor(response_type){

    super({
      additional_response_types: {
        noaction:{
          code: 'noaction'
        }
      }
    });

    if(!_.isUndefined(response_type)){
      this.setResponse(response_type);
    }
  }

  setAdditionalInformation(additional_information){

    this.additional_information = additional_information;

  }

  getAdditionalInformation(){

    if(_.has(this, 'additional_information')){
      return this.additional_information;
    }

    return null;

  }

}
