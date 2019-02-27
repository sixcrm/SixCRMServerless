const _ = require('lodash');

const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

module.exports = class verifyTransactionJWTController {

	constructor() {

		this.messages = {
			bypass: 'BYPASS'
		}

		jwtprovider.setJWTType('transaction');

	}

	execute(event) {

		this.assureResources();

		return Promise.resolve(this.verifyJWT(this.acquireToken(event)));

	}

	assureResources() {
		if(!objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.jwt.transaction.secret_key')) {

			throw eu.getError('server', 'Missing JWT secret key.');

		}

	}

	acquireToken(event) {
		if (_.has(event, 'authorizationToken')) {

			return event.authorizationToken;

		}

		return false;

	}

	verifyJWT(token) {
		let decoded_token = this.validateToken(token);

		if (decoded_token == false) {
			return false;
		}

		return decoded_token.user_alias; //Note: We know that this property exists because of the validation in the JWT Utilities class

	}

	validateToken(token) {
		return jwtprovider.verifyJWT(token, 'transaction');

	}

}
