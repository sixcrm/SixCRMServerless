const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class Token {

	constructor(){

		const TokenExController = global.SixCRM.routes.include('vendors', 'tokenizationproviders/tokenex/tokenex.js');
		this.tokenExController = new TokenExController();

	}

	setToken({entity, provider}){

		du.debug('Get Token');

		provider = (_.isUndefined(provider) || _.isNull(provider))?'tokenex':provider;

		if(provider == 'tokenex'){

			return this.tokenExController.setToken(entity).then((result) => {
				return {
					token: result.token,
					provider: 'tokenex'
				};
			});

		}

		eu.throwError('server', 'Unknown token provider: "'+provider+'".');

	}

	getToken({token, provider}){

		du.debug('Get Token');

		if(provider == 'tokenex'){

			return this.tokenExController.getToken(token).then((result) => {
				return result.value;
			});

		}

		eu.throwError('server', 'Unknown token provider: "'+provider+'".');

	}

	deleteToken({token, provider}){

		du.debug('Delete Token');

		if(provider == 'tokenex'){

			return this.tokenExController.deleteToken(token).then((result) => {
				return result.value;
			});

		}

		eu.throwError('server', 'Unknown token provider: "'+provider+'".');

	}

}
