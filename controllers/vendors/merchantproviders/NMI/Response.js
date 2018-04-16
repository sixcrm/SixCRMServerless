
const _ = require('lodash');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class NMIResponse extends Response {

	constructor(){

		super(arguments[0]);

	}

	determineResultCode({response, body, action}){

		du.debug('Determine Result Code');

		body = this.parseBody(body);

		if(action == 'process'){

			if(response.statusCode !== 200){
				return 'error';
			}

			if(response.statusMessage !== 'OK'){
				return 'error';
			}

			if(!_.has(body, 'response')){

				return 'error';

			}

			if(body.response == '1'){
				return 'success';
			}

			return 'fail';

		}else if(_.includes(['reverse','refund'], action)){

			if(response.statusCode == 200 && response.statusMessage == 'OK' && body.response == '1'){
				return 'success';
			}

			return 'fail';

		}else if(action == 'test'){

			if(response.statusCode == 200 && response.statusMessage == 'OK' && body.response == '3'){

				if(~body.responsetext.indexOf('The ccnumber field is required')){
					return 'success';
				}

			}

			return 'fail';

		}

		return 'error';

	}

	parseBody(body){

		du.debug('Parse Body');

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

		if(objectutilities.hasRecursive(processor_response, 'results.transactionid')){
			return processor_response.results.transactionid;
		}

		if(objectutilities.hasRecursive(processor_response, 'result.transactionid')){
			return processor_response.result.transactionid;
		}

		throw eu.getError('server', 'Unable to identify the Transaction ID');

	}

}
