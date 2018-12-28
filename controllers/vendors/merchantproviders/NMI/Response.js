
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

const SOFT_DECLINES = [200, 201, 202, 203, 240, 260, 264, 300, 400, 420, 421];

module.exports = class NMIResponse extends Response {

	constructor(){

		super(arguments[0]);

	}

	determineResultCode({vendor_response, action}){
		let {response, body} = vendor_response;

		body = this.parseBody(body);

		if(action == 'process'){

			if(response.statusCode === 200 && response.statusMessage === 'OK' && _.has(body, 'response') && body.response == '1'){
				return 'success';
			}

			if(_.has(body, 'response') && body.response === '2') {
				if (SOFT_DECLINES.includes(response.statusCode)) {
					return 'decline';
				}

				return 'harddecline';
			}

		}else if(_.includes(['reverse','refund'], action)){

			if(response.statusCode == 200 && response.statusMessage == 'OK' && body.response == '1'){
				return 'success';
			}

		}else if(action == 'test'){

			if(response.statusCode == 200 && response.statusMessage == 'OK' && body.response == '3'){

				if(~body.responsetext.indexOf('The ccnumber field is required')){
					return 'success';
				}

			}

		}

		return 'error';

	}

	parseBody(body){
		let parsed_body = null;

		try{

			parsed_body = querystring.parse(body);

		}catch(error){

			du.error(error);

			this.handleError(error);

		}

		return parsed_body;

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

		if(objectutilities.hasRecursive(processor_response, 'results.transactionid')){
			return processor_response.results.transactionid;
		}

		if(objectutilities.hasRecursive(processor_response, 'result.transactionid')){
			return processor_response.result.transactionid;
		}

		throw eu.getError('server', 'Unable to identify the Transaction ID');

	}

	determineMerchantCode(vendor_response) {

		let result = vendor_response;

		const parsed_body = querystring.parse(vendor_response.body);

		if (parsed_body.response_code) {
			result = parsed_body.response_code
		} else {
			result = super.determineMerchantCode(vendor_response);
		}

		return result;
	}

	determineMerchantMessage(vendor_response) {

		if (this.getCode() === 'success') {
			return 'Success';
		}

		let result = vendor_response;

		const parsed_body = querystring.parse(vendor_response.body);

		if (parsed_body.responsetext) {
			result = parsed_body.responsetext
		} else {
			result = super.determineMerchantMessage(vendor_response);
		}

		return result;

	}

}
