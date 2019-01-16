
const _ = require('lodash');
const ResponseController = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class WorkerResponse extends ResponseController {

	constructor(response_type){

		super();

		this.response_types = {
			noaction:{
				code: 'noaction'
			}
		};

		this.parameter_validation = {
			response_type: global.SixCRM.routes.path('model', 'workers/workerresponsetype.json')
		}

		this.initialize();

		if(!_.isUndefined(response_type)){
			this.setResponse(response_type);
		}
	}

	setAdditionalInformation(additional_information){

		this.additional_information = additional_information;

	}

	getAdditionalInformation(){

		if(_.has(this, 'additional_information')){
			return this.additional_information;
		}

		return null;

	}

}
