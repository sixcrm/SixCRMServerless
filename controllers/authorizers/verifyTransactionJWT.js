const _ = require('lodash');

const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

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

		du.debug('Assure Resources');

		if(!objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.jwt.transaction.secret_key')) {

			throw eu.getError('server', 'Missing JWT secret key.');

		}

	}

	acquireToken(event) {

		du.debug('Acquire Token');

		if (_.has(event, 'authorizationToken')) {

			return event.authorizationToken;

		}

		return false;

	}

	verifyJWT(token) {

		du.debug('Verify JWT');

		let decoded_token = this.validateToken(token);

		du.debug('Decoded Token: ', decoded_token);

		if (decoded_token == false) {
			return false;
		}

		return decoded_token.user_alias; //Note: We know that this property exists because of the validation in the JWT Utilities class

	}

	validateToken(token) {

		du.debug('Validate Token');

		return jwtprovider.verifyJWT(token, 'transaction');

	}

}
