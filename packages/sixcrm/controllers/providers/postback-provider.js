const request = require('request');
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;

module.exports = class PostbackProvider {

	constructor(){

	}

	executePostback(url, data){
		let parsed_url = parserutilities.parse(url, data);

		return this.executeRequest(parsed_url);

	}

	executeRequest(parsed_url){
		return new Promise((resolve, reject) => {

			var request_options = {
				url: parsed_url
			};

			request.get(request_options, (error, response) => {

				if(error){ return reject(error); }

				return resolve(response);

			});

		});

	}

}

