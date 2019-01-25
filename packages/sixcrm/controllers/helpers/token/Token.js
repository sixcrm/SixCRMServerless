const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');

module.exports = class Token {

	getTokensSchema(){
		let model = global.SixCRM.routes.include('model', 'tokens/all.json');

		return {tokens: model};

	}

	getCustomerJWT(customer){
		const jwtprovider = new JWTProvider();

		const customer_jwt_prototype = this.createCustomerJWTPrototype(customer);

		return jwtprovider.getJWT(customer_jwt_prototype, 'customer');

	}

	createCustomerJWTPrototype(customer){
		let prototype = this.getBaseJWTPrototype();

		const customer_id = (_.has(customer, 'id'))?customer.id:customer;

		if(!stringutilities.isUUID(customer_id)){
			throw eu.getError('server', 'Customer ID is not a UUID');
		}

		prototype.customer = customer_id;

		return prototype;

	}

	getBaseJWTPrototype(){
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
