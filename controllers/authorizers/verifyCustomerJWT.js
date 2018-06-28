const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');

module.exports = class VerifyCustomerJWTController {

	constructor() {

		this.parameter_definition = {
			event: {
				required: {
					encoded_authorization_token: 'authorizationToken'
				},
				optional: {}
			}

		}

		this.parameter_validation = {
			verified_authorization_token: global.SixCRM.routes.path('model', 'definitions/jwt.json'),
			encoded_authorization_token: global.SixCRM.routes.path('model', 'definitions/jwt.json'),
			decoded_authorization_token: global.SixCRM.routes.path('model', 'authorization/decodedauthorizationtoken.json')
		}

		this.jwtprovider = new JWTProvider();
		this.jwtprovider.setJWTType('customer');

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definition
		});

	}

	async execute(event) {

		du.debug('Execute');

		this.setParameters(event);

		try{

			this.decodeToken();

			this.verifyEncodedTokenWithCustomerSecretKey();

		}catch(error){

			du.error(error);

		}

		return this.respond();

	}

	decodeToken() {

		du.debug('Decode Token');

		let token = this.parameters.get('encoded_authorization_token');

		let decoded_token = this.jwtprovider.decodeJWT(token);

		if (decoded_token) {

			this.parameters.set('decoded_authorization_token', decoded_token);

			return true;

		}

		throw eu.getError('bad_request', 'Unable to decode token with customer signing string.');

	}

	//Technical Debt:  Is this redundant?  Note that the decodeToken method already appears to verify the signing string.
	verifyEncodedTokenWithCustomerSecretKey() {

		du.debug('Verify Encoded Token With Customer Secret Key');

		let encoded_token = this.parameters.get('encoded_authorization_token');

		if(this.jwtprovider.verifyJWT(encoded_token, 'customer')) {

			this.parameters.set('verified_authorization_token', encoded_token);

		}else{

			throw eu.getError('bad_request', 'Unable to verify authorization token.');

		}

		return true;

	}

	respond() {

		du.debug('Respond');

		let verified_token = this.parameters.get('verified_authorization_token', {fatal: false});

		if (!_.isNull(verified_token)) {

			return this.parameters.get('decoded_authorization_token').customer;

		}

		return null;

	}

	setParameters(event) {

		du.debug('Set Parameters');

		this.parameters.setParameters({
			argumentation: event,
			action: 'event'
		});

		return true;

	}

}
