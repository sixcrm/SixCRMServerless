
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class StripeResponse extends MerchantProviderResponse {

	constructor(){

		super(arguments[0]);

	}

	determineResultCode({vendor_response, action}){

		du.debug('Determine Result Code');
		const {
			response,
			body,
			error
		} = vendor_response

		if(action == 'process'){

			if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){
				return 'success';
			}

			if (!_.isNull(error) && error.code === 'card_declined') {
				return 'decline';
			}

		}else if(action == 'test'){

			if(response.statusCode == '200' && response.statusMessage == 'OK' && _.has(body, 'object')){

				return 'success';

			}

		}else if(action == 'refund'){

			if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){

				return 'success';

			}

		}else if(action == 'reverse'){

			if(_.has(body, 'id') && _.has(body, 'status') && body.status == 'succeeded'){

				return 'success';

			}

		}

		return 'error';


	}

}
