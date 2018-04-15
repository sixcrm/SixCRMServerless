
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');

const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class StripeResponse extends MerchantProviderResponse {

  constructor(){

    super(arguments[0]);

  }

  determineResultCode({response, body, action}){

    du.debug('Determine Result Code');

    if(action == 'process'){

      if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){
        return 'success';
      }

      return 'fail';

    }else if(action == 'test'){

      if(response.statusCode == '200' && response.statusMessage == 'OK' && _.has(body, 'object')){

        return 'success';

      }

      return 'fail';

    }else if(action == 'refund'){

      if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){

        return 'success';

      }

      return 'fail';

    }else if(action == 'reverse'){

      if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){

        return 'success';

      }

      return 'fail';

    }

    return 'error';


  }

}
