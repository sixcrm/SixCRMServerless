const _ = require('lodash');
const jwt = require('jsonwebtoken');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const mungeutilities = require('@sixcrm/sixcrmcore/util/munge-utilities').default;

//Technical Debt: Refactor
module.exports = class JWTProvider {

	constructor() {

		this.setParameters();

		this.jwt_types = [
			'transaction',
			'site', // Technical Debt: this should probably be renamed to 'user'
			'customer'];

	}

	decodeJWT(jwt_string, jwt_signing_string) {

		let decoded_jwt;

		try {

			if (!_.isUndefined(jwt_signing_string)) {
				decoded_jwt = jwt.verify(jwt_string, jwt_signing_string);
			} else {
				decoded_jwt = jwt.decode(jwt_string);
			}


		} catch (error) {

			return false;

		}

		return decoded_jwt;

	}

	decodeAndValidateJWT(jwt_string, jwt_signing_string) {

		du.debug('Decode and Validate JWT');

		let decoded_and_validated_jwt;

		try {

			decoded_and_validated_jwt = jwt.verify(jwt_string, jwt_signing_string);

		} catch (error) {

			du.error(error);

			return false;

		}

		du.info(decoded_and_validated_jwt);

		if (decoded_and_validated_jwt === false) {
			return false;
		}

		try {

			this.validateJWTContents(decoded_and_validated_jwt);

		} catch (error) {
			return false;

		}

		return decoded_and_validated_jwt;

	}

	/*
	 * Entrypoint
	 */
	verifyJWT(submitted_jwt, jwt_type) {

		du.debug('Verify JWT');

		this.setJWTType(jwt_type);

		let signing_key = this.getSigningKey();

		return this.decodeAndValidateJWT(submitted_jwt, signing_key);

	}

	setParameters() {

		du.debug('Set Parameters');

		let parameters = {
			jwt_issuer: global.SixCRM.configuration.site_config.jwt.issuer,
			transaction_jwt_expiration: global.SixCRM.configuration.site_config.jwt.transaction.expiration,
			transaction_jwt_secret_key: global.SixCRM.configuration.site_config.jwt.transaction.secret_key,
			site_jwt_expiration: global.SixCRM.configuration.site_config.jwt.site.expiration,
			site_jwt_secret_key: global.SixCRM.configuration.site_config.jwt.site.secret_key,
			customer_jwt_expiration: global.SixCRM.configuration.site_config.jwt.customer.expiration,
			customer_jwt_secret_key: global.SixCRM.configuration.site_config.jwt.customer.secret_key
		};

		this.jwt_parameters = {};

		objectutilities.map(parameters, (key) => {
			const value = parameters[key];

			if(!_.isNull(value) || _.isUndefined(value)){
				this.jwt_parameters[key] = value;
			}

		});

	}

	setJWTType(jwt_type) {
		du.debug('Set JWT Type');

		if (!_.isUndefined(jwt_type)) {

			if (_.includes(this.jwt_types, jwt_type)) {
				this.jwt_type = jwt_type;
			} else {
				this.unrecognzedJWTType();
			}

		}

	}

	getJWTType() {

		du.debug('Get JWT Type');

		if (_.has(this, 'jwt_type')) {

			return this.jwt_type;

		}

		throw eu.getError('validation', 'Unset jwt_type property.');

	}

	getJWT(parameters, jwt_type) {

		du.debug('Get JWT');

		this.setJWTType(jwt_type);

		let jwt_contents = this.createJWTContents(parameters);

		return this.signJWT(jwt_contents);

	}

	createJWTContents(parameters) {

		du.debug('Create JWT Contents');

		let jwt_contents;

		switch (this.getJWTType()) {

			case 'transaction':

				jwt_contents = this.createTransactionJWTContents(parameters);

				break;

			case 'site':

				jwt_contents = this.createSiteJWTContents(parameters);

				break;

			case 'customer':

				jwt_contents = this.createCustomerJWTContents(parameters);

				break;

			default:

				this.unrecognzedJWTType();

		}

		this.validateJWTContents(jwt_contents);

		return jwt_contents;

	}

	validateJWTContents(jwt_contents) {

		du.debug('Validate JWT Contents');

		let validation_function;

		switch (this.getJWTType()) {

			case 'transaction':

				validation_function = this.validateTransactionJWTContents;

				break;

			case 'site':

				validation_function = this.validateSiteJWTContents

				break;

			case 'customer':

				validation_function = this.validateCustomerJWTContents

				break;

			default:

				this.unrecognzedJWTType();

		}

		this.validateInput(jwt_contents, validation_function);

	}

	validateInput(object, validation_function) {

		du.debug('Validate Input');

		if (!_.isFunction(validation_function)) {
			throw eu.getError('server', 'Validation function is not a function.');
		}

		if (_.isUndefined(object)) {
			eu.getError('validation', 'Undefined object input.');
		}

		//Technical Debt:  Why is this necessary?
		var params = JSON.parse(JSON.stringify(object || {}));

		validation_function(params);
	}

	validateTransactionJWTContents(contents) {
		const transaction_jwt_schema = global.SixCRM.routes.path('model', 'jwt/transaction.json');
		return global.SixCRM.validate(contents, transaction_jwt_schema);
	}

	validateSiteJWTContents(contents) {
		const site_jwt_schema = global.SixCRM.routes.path('model', 'jwt/site.json');
		return global.SixCRM.validate(contents, site_jwt_schema);
	}

	validateCustomerJWTContents(contents) {
		const customer_jwt_schema = global.SixCRM.routes.path('model', 'jwt/customerjwt.json');
		return global.SixCRM.validate(contents, customer_jwt_schema);
	}

	getUserAlias(user) {

		du.debug('Get User Alias');

		if (_.has(user, 'user_alias')) {
			return user.user_alias;
		} else if (_.has(user, 'id')) {
			return mungeutilities.munge(user.id);
		} else if (_.has(user, 'email')) {
			return mungeutilities.munge(user.email);
		}

		return null;

	}

	signJWT(jwt_body, signing_key) {

		du.debug('Sign JWT');

		if (_.isUndefined(signing_key)) {

			signing_key = this.getSigningKey();

		}

		return jwt.sign(jwt_body, signing_key);

	}

	getSigningKey() {

		du.debug('Get Signing Key');

		switch (this.getJWTType()) {

			case 'transaction':

				if (!_.has(this.jwt_parameters, 'transaction_jwt_secret_key')) {
					throw eu.getError('validation', 'Transaction JWT secret key is not defined.');
				}

				du.debug(this.jwt_parameters.transaction_jwt_secret_key);

				return this.jwt_parameters.transaction_jwt_secret_key;

			case 'site':

				if (!_.has(this.jwt_parameters, 'site_jwt_secret_key')) {
					throw eu.getError('validation', 'Site JWT secret key is not defined.');
				}

				return this.jwt_parameters.site_jwt_secret_key;

			case 'customer':

				if (!_.has(this.jwt_parameters, 'customer_jwt_secret_key')) {
					throw eu.getError('validation', 'Customer JWT secret key is not defined.');
				}

				return this.jwt_parameters.customer_jwt_secret_key;

			default:

				du.warning('Unrecognized JWT Type');

		}

		this.unrecognzedJWTType();

	}

	unrecognzedJWTType() {

		du.debug('Unrecognzed JWT Type');

		throw eu.getError('validation', 'Unrecognized JWT Type.');

	}

	createTransactionJWTContents(parameters) {

		du.debug('Create Transaction JWT Contents');

		let user_alias = this.getUserAlias(parameters.user);

		let now = timestamp.createTimestampSeconds();

		let transaction_jwt_contents = {
			"iss": this.jwt_parameters.jwt_issuer,
			"sub": "",
			"aud": "",
			"iat": now,
			"exp": now + parseInt(this.jwt_parameters.transaction_jwt_expiration),
			"user_alias": user_alias
		};

		return transaction_jwt_contents;

	}

	createSiteJWTContents(parameters) {

		let email = this.getUserEmail(parameters);

		let now = timestamp.createTimestampSeconds();

		return {
			"email": email,
			"email_verified": true,
			"picture": "",
			"iss": this.jwt_parameters.jwt_issuer,
			"sub": "",
			"aud": "",
			"exp": now + parseInt(this.jwt_parameters.site_jwt_expiration),
			"iat": now
		};

	}

	createCustomerJWTContents(parameters) {

		let now = timestamp.createTimestampSeconds();

		return {
			"customer": parameters.customer,
			"iss": this.jwt_parameters.jwt_issuer,
			"sub": "",
			"aud": "",
			"exp": now + parseInt(this.jwt_parameters.customer_jwt_expiration),
			"iat": now
		};

	}

	//Technical Debt:  Seems deprecated...
	getUserEmail(parameters) {
		du.debug('Get User Email');
		if(_.has(parameters, 'user') && _.has(parameters.user, 'email')) {
			return parameters.user.email;
		}
		throw eu.getError('validation', 'Unable to get user email.');
	}

}
