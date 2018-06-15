
const _ = require('lodash');
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

//Technical Debt: extends ResponseController??
module.exports = class RelayResponse{

	constructor(response_type){

		this.response_types = {
			success:{
				//forward the messages where available
				code: 'success'
			},
			decline:{
				//forward to the decline queue where available
				code: 'decline'
			},
			error: {
				//forward to the DLQ where available
				code: 'error'
			},
			noaction:{
				//do nothing
				code: 'noaction'
			}
		};

		if(!_.isUndefined(response_type)){
			this.setResponse(response_type);
		}
	}

	setResponse(response_type){

		if(_.has(this.response_types, response_type)){
			this.response = this.response_types[response_type];
		}else{
			throw eu.getError('server', 'Unexpected Response Type: "'+response_type+'".');
		}

	}

	validateResponse(response){

		let valid_response = arrayutilities.find(this.response_types, response_type => {

			return (_.isEqual(response, response_type));

		});

		if(valid_response){
			return true;
		}
		return false;

	}

	getCode(){

		if(objectutilities.hasRecursive(this, 'response.code')){

			return this.response.code;

		}

		return null;

	}

}
