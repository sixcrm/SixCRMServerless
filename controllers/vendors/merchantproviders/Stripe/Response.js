
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

const SOFT_DECLINES = [
	'approve_with_id',
	'issuer_not_available',
	'processing_error',
	'reenter_transaction',
	'try_again_later'
];


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

			if (!_.isNull(error) && error.rawType === 'card_error') {

				du.debug('Detecting Soft Decline Stripe', error.code, error, SOFT_DECLINES);

				if (SOFT_DECLINES.includes(error.code)) {
					return 'decline';
				}


				return 'harddecline';
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

	determineMerchantMessage(vendor_response) {

		du.debug('Determine Merchant Message (Stripe)', vendor_response);

		if (this.getCode() === 'success') {
			return 'Success';
		}

		let result = '';

		result = _(vendor_response).get('body', result);
		result = _(vendor_response).get('response.body', result);

		result = _(vendor_response).get('body.outcome.seller_message', result);
		result = _(vendor_response).get('response.body.outcome.seller_message', result);

		result = _(vendor_response).get('body.outcome.network_status', result);
		result = _(vendor_response).get('response.body.outcome.network_status', result);

		result = _(vendor_response).get('body.reason', result);
		result = _(vendor_response).get('response.body.reason', result);

		result = _(vendor_response).get('body.message', result);
		result = _(vendor_response).get('response.body.message', result);

		if (result === '' || typeof result !== 'string') {
			result = super.determineMerchantMessage(vendor_response);
		}

		du.debug('Determined Merchant Message (Stripe)', result);

		return result;

	}

}
