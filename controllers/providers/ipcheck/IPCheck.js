const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
module.exports = class IPCheck {
	constructor(){}
	checkIP(){

		du.debug('Check IP');

		const HTTPProvider = global.SixCRM.routes.include('providers', 'http-provider.js');
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
