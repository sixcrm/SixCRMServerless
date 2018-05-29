const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');

module.exports = class UserAuthenticatedController extends AuthenticatedController {

	constructor(){

		super();

	}

}
