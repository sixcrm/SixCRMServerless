const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
module.exports = class IPCheck {
	constructor(){}
	checkIP(){
		const HTTPProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
		let httpprovider = new HTTPProvider();

		const parameters = {
			'endpoint':'https://api.ipify.org'
		};

		return httpprovider.getJSON(parameters).then(result => {

			if(_.has(result, 'body') && _.isString(result.body)){
				return {ip_address: result.body};
			}
			throw eu.getError('server', 'Unexpected response: '+result);

		});

	}

}
