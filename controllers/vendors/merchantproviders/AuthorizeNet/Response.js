const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class AuthorizeNetResponse extends MerchantProviderResponse {
	constructor(){
		super(arguments[0]);
	}

	determineResultCode({vendor_response}) {
		du.debug('Determine Result Code');
		const { body, error } = vendor_response;

		if (error === null) {
			return 'success';
		}

		if (_.has(body, 'transactionResponse') && body.transactionResponse.responseCode === '2') {
			return 'harddecline';
		}

		return 'error';
	}

	determineMerchantCode(vendor_response) {

		du.debug('Determine Merchant Code (AuthorizeNet)', vendor_response);

		let result = '';

		result = _(vendor_response).get('body.transactionResponse.responseCode', result);

		if (result === '' || typeof result !== 'string') {
			result = super.determineMerchantMessage(vendor_response);
		}

		du.debug('Determined Merchant Code (AuthorizeNet)', result);

		return result;

	}

	determineMerchantMessage(vendor_response) {

		du.debug('Determine Merchant Message (AuthorizeNet)', vendor_response);

		if (this.getCode() === 'success') {
			return 'Success';
		}

		let result = '';

		result = _(vendor_response).get('body.transactionResponse.messages[0].description', result);

		if (result === '' || typeof result !== 'string') {
			result = super.determineMerchantMessage(vendor_response);
		}

		du.debug('Determined Merchant Message (AuthorizeNet)', result);

		return result;

	}
}
