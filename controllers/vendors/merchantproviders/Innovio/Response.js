
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class InnovioResponse extends Response {

  constructor(){

    super(arguments[0]);

  }

  determineResultCode({response, body, action}){

    du.debug('Determine Result Code');

    if(action == 'process'){

      if(response.statusCode !== 200){
        return 'error';
      }

      if(response.statusMessage !== 'OK'){
        return 'error';
      }

      body = this.parseBody(body);

      if(!_.has(body, 'TRANS_STATUS_NAME')){

        return 'error';

      }

      if(body.TRANS_STATUS_NAME == 'APPROVED'){
        return 'success';
      }

      return 'fail';

    }else if(_.includes(['reverse','refund'], action)){

      body = this.parseBody(body);

      if(!_.has(body, 'TRANS_STATUS_NAME')){

        return 'error';

      }

      if(response.statusCode == 200 && response.statusMessage == 'OK' && body.TRANS_STATUS_NAME == 'APPROVED'){
        return 'success';
      }

      return 'fail';

    }else if( action == 'test'){

      body = this.parseBody(body);

      if(response.statusCode == 200 && response.statusMessage == 'OK' && body.SERVICE_ADVICE == 'User Authorized'){
        return 'success';
      }

      return 'fail';

    }

    return 'error';

  }

  parseBody(body){

    du.debug('Parse Response');

    let parsed_response = null;

    try{

      parsed_response = JSON.parse(body);

    }catch(error){

      du.error(error);

      this.handleError(error);

    }

    return parsed_response;

  }

}
