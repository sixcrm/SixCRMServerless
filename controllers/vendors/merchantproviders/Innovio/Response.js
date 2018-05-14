
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class InnovioResponse extends Response {

	constructor(){

		super(arguments[0]);

	}

	determineResultCode({vendor_response, action}){

		du.debug('Determine Result Code');
		let {response, body} = vendor_response;
		body = this.parseBody(body);

		if(action == 'process'){

			if(response.statusCode === 200 && response.statusMessage === 'OK' && _.has(body, 'TRANS_STATUS_NAME') && body.TRANS_STATUS_NAME === 'APPROVED'){
				return 'success';
			}

			if(_.has(body, 'TRANS_STATUS_NAME') && body.TRANS_STATUS_NAME === 'DECLINED'){
				return 'decline';
			}

		}else if(_.includes(['reverse','refund'], action)){

			if(_.has(body, 'TRANS_STATUS_NAME') && response.statusCode == 200 && response.statusMessage == 'OK' && body.TRANS_STATUS_NAME == 'APPROVED'){
				return 'success';
			}

			if(_.has(body, 'TRANS_STATUS_NAME') && body.TRANS_STATUS_NAME == 'DECLINED'){
				return 'decline';
			}

		}else if( action == 'test'){

			if(response.statusCode == 200 && response.statusMessage == 'OK' && body.SERVICE_ADVICE == 'User Authorized'){
				return 'success';
			}

		}

		return 'error';

	}

	parseBody(body){

		du.debug('Parse Response');

		let parsed_response = null;

		try{

			parsed_response = JSON.parse(body);

		}catch(error){

			du.error(error);

			this.handleError(error);

		}

		return parsed_response;

	}

}
