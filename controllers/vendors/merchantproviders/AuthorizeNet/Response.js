const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
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
			return 'decline';
		}

		return 'error';
	}
}
