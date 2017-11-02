'use strict'
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class WorkerResponse{

  constructor(response_type){

    this.response_types = {
      success:{
        //forward the messages where available
        code: 'success'
      },
      fail:{
        //forward tot the fail queue where avialable
        code: 'fail'
      },
      error: {
        //forward to the DLQ where available
        code: 'error'
      },
      noaction:{
        //do nothing
        code: 'noaction'
      }
    };

    if(!_.isUndefined(response_type)){
      this.setResponse(response_type);
    }
  }

  setResponse(response_type){

    if(_.has(this.response_types, response_type)){
      this.response = this.response_types[response_type];
    }else{
      eu.throwError('server', 'Unexpected Response Type: "'+response_type+'".');
    }

  }

  validateResponse(response){

    let valid_response = arrayutilities.find(this.response_types, response_type => {

      return (_.isEqual(response, response_type));

    });

    if(valid_response){
      return true;
    }
    return false;

  }

  getCode(){

    if(objectutilities.hasRecursive(this, 'response.code')){

      return this.response.code;

    }

    return null;

  }

}
