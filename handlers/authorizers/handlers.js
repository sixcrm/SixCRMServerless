const _ = require('lodash');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const AuthorizationHandler = require('./authorization-handler');

const VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
const VerifySiteJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifySiteJWT.js');
const VerifyTransactionJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifyTransactionJWT.js');

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

	verifytransactionjwt: handleAuthorization(async (event) => {
		let response = await new VerifyTransactionJWTController().execute(event);
		if (_.isString(response)) {
			return { allow: true, response }
		} else {
			return { allow: false }
		}
	})
};

function handleAuthorization(delegate) {
	return (event, context, callback) => new AuthorizationHandler().handle(event, context, callback, delegate);
}
