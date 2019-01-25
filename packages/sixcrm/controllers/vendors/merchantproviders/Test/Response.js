
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class TestResponse extends Response {

	constructor(){

		super(arguments[0]);

	}

	getTransactionID(transaction){
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
		if(parsed_response.success == true){
			return 'success';
		}else if(parsed_response.response == '2'){
			return 'decline';
		}

		return 'error';

	}

	mapResponseMessage({parsed_response}){
		if(_.has(parsed_response, 'success')){
			return 'Success';
		}

		return null;

	}

	parseResponse({body}){
		return body;
	}

	determineMerchantMessage(vendor_response) {

		if (this.getCode() === 'success') {
			return 'Test success';
		} else {
			return super.determineMerchantMessage(vendor_response);
		}

	}

}
