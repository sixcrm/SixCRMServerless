const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString.js');

module.exports = class verifySiteJWTController {

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
			user_signing_strings: global.SixCRM.routes.path('model', 'authorization/usersigningstrings.json'),
			encoded_authorization_token: global.SixCRM.routes.path('model', 'definitions/jwt.json'),
			decoded_authorization_token: global.SixCRM.routes.path('model', 'authorization/decodedauthorizationtoken.json')
		}

		this.messages = {
			bypass: 'BYPASS'
		}

		this.jwtprovider = new JWTProvider();
		this.jwtprovider.setJWTType('site');

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definition
		});

		this.userSigningStringController = new UserSigningStringController();

	}

	execute(event) {

		return this.setParameters(event)
			.then(() => this.decodeToken())
			.then(() => this.verifyEncodedTokenWithSiteSecretKey())
			.then(() => this.verifyEncodedTokenWithUserSigningString())
			.then(() => this.respond());

	}

	decodeToken() {

		du.debug('Decode Token');

		let token = this.parameters.get('encoded_authorization_token');

		let decoded_token = this.jwtprovider.decodeJWT(token);

		if (decoded_token) {

			this.parameters.set('decoded_authorization_token', decoded_token);

			return Promise.resolve();

		}

		throw eu.getError('bad_request', 'Unable to decode token.');

	}

	verifyEncodedTokenWithSiteSecretKey() {

		du.debug('Verify Encoded Token With Site Secret Key');

		let encoded_token = this.parameters.get('encoded_authorization_token');

		if (this.jwtprovider.verifyJWT(encoded_token)) {

			this.parameters.set('verified_authorization_token', encoded_token);

		}

		return Promise.resolve();

	}

	verifyEncodedTokenWithUserSigningString() {

		du.debug('Verify Encoded Token With User Signing String');

		let verified_token = this.parameters.get('verified_authorization_token', null, false);

		if (_.isNull(verified_token)) {

			return this.getUserSigningStrings()
				.then(() => this.verifyEncodedTokenWithUserSigningStrings());

		}

		return Promise.resolve();

	}

	getUserSigningStrings() {

		du.debug('Get User Signing Strings');

		let user_id = this.parameters.get('decoded_authorization_token').email;

		this.userSigningStringController.disableACLs();
		//Technical Debt: update to list by user
		return this.userSigningStringController.listByUser({
			user: user_id
		})
			.then((results) => this.userSigningStringController.getResult(results, 'usersigningstrings'))
			.then(usersigningstrings => {
				this.userSigningStringController.enableACLs();

				if (arrayutilities.nonEmpty(usersigningstrings)) {
					return this.parameters.set('user_signing_strings', usersigningstrings);
				}

				return true;
			});

	}

	verifyEncodedTokenWithUserSigningStrings() {

		du.debug('Verify Encoded Token With User Signing Strings');

		let user_signing_strings = this.parameters.get('user_signing_strings', null, false);

		if (!_.isNull(user_signing_strings)) {

			let encoded_token = this.parameters.get('encoded_authorization_token');

			arrayutilities.find(user_signing_strings, (user_signing_string) => {
				if (this.jwtprovider.decodeJWT(encoded_token, user_signing_string.signing_string)) {
					this.parameters.set('verified_authorization_token', encoded_token);
					return true;
				}
				return false;
			});

		}

	}

	respond() {

		du.debug('Respond');

		let verified_token = this.parameters.get('verified_authorization_token', null, false);

		if (!_.isNull(verified_token)) {

			return this.parameters.get('decoded_authorization_token').email;

		}

		return null;

	}

	setParameters(event) {

		du.debug('Set Parameters');

		this.parameters.setParameters({
			argumentation: event,
			action: 'event'
		});

		return Promise.resolve(true);

	}

}
