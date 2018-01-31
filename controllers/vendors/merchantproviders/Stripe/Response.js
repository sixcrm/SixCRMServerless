'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class StripeResponse extends MerchantProviderResponse {

  constructor({vendor_response, action, additional_parameters}){

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
