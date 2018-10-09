const querystring = require('querystring');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const MerchantProviderResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

// Taken from https://www.paymentxp.com/Api/GatewayApi.aspx#menu_appendix_a
const messageMap = {
	'0': 'Success',
	'5': 'System Error',
	'8': 'Not Authorized',
	'9': 'Invalid Card Number',
	'10': 'Insufficient Funds',
	'16': 'Invalid Transaction',
	'19': 'Declined',
	'20': 'Timeout',
	'21': 'AVS Zipcode No Match',
	'26': 'CVV No Match',
	'32': 'Credit Card Processing Disabled for Merchant',
	'86': 'Invalid Input Data',
	'88': 'Invalid Response Data',
	'93': 'Duplicate Transaction',
	'99': 'Unknown'
};

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

	determineMerchantCode(vendor_response) {

		du.debug('Determine Merchant Code (PaymentXP)', vendor_response);

		let result = vendor_response;

		const parsed_body = querystring.parse(vendor_response.body);

		if (parsed_body.StatusID) {
			result = parsed_body.StatusID
		} else {
			result = super.determineMerchantCode(vendor_response);
		}

		du.debug('Determined Merchant Code (PaymentXP)', result);

		return result;
	}

	determineMerchantMessage(vendor_response) {

		du.debug('Determine Merchant Message (PaymentXP)', vendor_response);

		if (this.getCode() === 'success') {
			return 'Success';
		}

		let result = vendor_response;

		const parsed_body = querystring.parse(vendor_response.body);

		if (parsed_body.StatusID) {
			result = messageMap[parsed_body.StatusID]
		} else {
			result = super.determineMerchantMessage(vendor_response);
		}

		du.debug('Determined Merchant Message (PaymentXP)', result);

		return result;

	}
}
