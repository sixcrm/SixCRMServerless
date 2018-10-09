
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class TestResponse extends Response {

	constructor(){

		super(arguments[0]);

	}

	getTransactionID(transaction){

		du.debug('Get Transaction ID');

		let processor_response = null;

		if(_.has(transaction, 'processor_response')){
			processor_response = transaction.processor_response;
			try{
				processor_response = JSON.parse(processor_response);
			}catch(error){
				//do nothing
			}
		}

		if(objectutilities.hasRecursive(processor_response, 'response.transactionid')){
			return processor_response.response.transactionid;
		}

		throw eu.getError('server', 'Unable to identify the Transaction ID');

	}

	mapResponseCode({parsed_response}){

		du.debug('Map Response Code');

		if(parsed_response.success == true){
			return 'success';
		}else if(parsed_response.response == '2'){
			return 'decline';
		}

		return 'error';

	}

	mapResponseMessage({parsed_response}){

		du.debug('Map Response Message');

		if(_.has(parsed_response, 'success')){
			return 'Success';
		}

		return null;

	}

	parseResponse({ body:body}){

		du.debug('Parse Response');

		return body;


	}

	determineMerchantCode(vendor_response) {

		du.debug('Determine Merchant Code (Test)', vendor_response);

		let result = vendor_response;

		result = _(vendor_response).get('response_code', result);
		result = _(vendor_response).get('response.response_code', result);

		du.debug('Determined Merchant Code (Test)', result);

		if (typeof result !== 'string') {
			result = JSON.stringify(result)
		}

		return result;
	}

	determineMerchantMessage(vendor_response) {

		du.debug('Determine Merchant Message (Test)', vendor_response);

		if (this.getCode() === 'success') {
			return 'Test success';
		} else {
			return super.determineMerchantMessage(vendor_response);
		}

	}

}
