const AuthorizationHandler = require('./authorization-handler');

const VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
const VerifySiteJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifySiteJWT.js');
const VerifyCustomerJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifyCustomerJWT.js');
const VerifyTransactionJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifyTransactionJWT.js');

const _ = require('lodash');
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

function handleAuthorization(delegate, field_name = 'user'){
	return (event, context, callback) => new AuthorizationHandler().handle(event, context, callback, delegate, field_name);
}

module.exports = {
	verifysignature: handleAuthorization(async (event) => {
		let authority_user = await new VerifySignatureController().execute(event);
		if (_.isObject(authority_user) && _.has(authority_user, 'id')) {
			return { allow: true, response: authority_user.id }
		} else {
			return { allow: false }
		}
	}),
	verifysitejwt: handleAuthorization(async (event) => {
		let controller = new VerifySiteJWTController();
		let response = await controller.execute(event);
		if(stringutilities.isEmail(response)){
			return { allow: true, response };
		}
		else if (response == controller.messages.bypass) {
			return { allow: true, response: null };
		}
		else {
			return { allow: false }
		}
	}),
	verifycustomerjwt: handleAuthorization(async (event) => {
		let controller = new VerifyCustomerJWTController();
		let response = await controller.execute(event);
		if(stringutilities.isUUID(response)){
			return { allow: true, response };
		}else if (response == controller.messages.bypass) {
			return { allow: true, response: null };
		}else {
			return { allow: false }
		}
	}, 'customer'),
	verifytransactionjwt: handleAuthorization(async (event) => {
		let response = await new VerifyTransactionJWTController().execute(event);
		if (_.isString(response)) {
			return { allow: true, response }
		} else {
			return { allow: false }
		}
	})
};
