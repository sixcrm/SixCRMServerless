const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const mbu = require('@sixcrm/sixcrmcore/util/model-builder-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');

module.exports = class Token {

	getTokensSchema(){

		du.debug('Token List');

		let model = mbu.build('tokens/all.json');

		return {tokens: model};

	}

	getCustomerJWT(customer){

		du.debug('Get Customer JWT');

		const jwtprovider = new JWTProvider();

		const customer_jwt_prototype = this.createCustomerJWTPrototype(customer);

		return jwtprovider.getJWT(customer_jwt_prototype, 'customer');

	}

	createCustomerJWTPrototype(customer){

		du.debug('Create Customer JWT Prototype');

		let prototype = this.getBaseJWTPrototype();

		const customer_id = (_.has(customer, 'id'))?customer.id:customer;

		if(!stringutilities.isUUID(customer_id)){
			throw eu.getError('server', 'Customer ID is not a UUID');
		}

		prototype.customer = customer_id;

		return prototype;

	}

	getBaseJWTPrototype(){

		du.debug('Get Base Prototype');

		const now = timestamp.createTimestampSeconds();

		return {
			iss: global.SixCRM.configuration.getBase(),
			sub: '',
			aud: '',
			exp: (now + 3600),
			iat: now
		};

	}

}
