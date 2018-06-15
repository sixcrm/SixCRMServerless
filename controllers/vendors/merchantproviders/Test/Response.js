
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

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

}
