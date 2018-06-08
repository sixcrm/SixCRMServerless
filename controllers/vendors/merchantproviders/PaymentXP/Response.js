const querystring = require('querystring');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class PaymentXPResponse extends MerchantProviderResponse {
	constructor(){
		super(arguments[0]);
	}

	determineResultCode({vendor_response}) {
		du.debug('Determine Result Code');
		const body = querystring.parse(vendor_response.body);

		if (body.StatusID === '0') {
			return 'success';
		}

		if (body.StatusID === '19') {
			return 'decline';
		}

		return 'error';
	}
}
