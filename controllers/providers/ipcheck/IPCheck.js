const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
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
