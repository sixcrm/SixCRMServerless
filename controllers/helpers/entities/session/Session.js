

const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = class SessionHelperController {

	constructor(){

		this.parameter_definition = {};

		this.parameter_validation = {};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	isComplete({session}){

		du.debug('Is Complete');

		if(session.completed == true){
			return true;
		}

		return false;

	}

	isCurrent({session: session}){

		du.debug('Is Current');

		let session_length = global.SixCRM.configuration.site_config.jwt.transaction.expiration;

		let expired = session.created_at < timestamp.toISO8601(timestamp.createTimestampSeconds() - session_length);

		return !expired;

	}

	getSessionByCustomerAndID({customer, id}){

		du.debug('Get Session By Customer and ID');

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.get({id:id}).then(session => {

			if(_.isNull(session)){ return null; }

			return this.sessionController.getCustomer(session).then(customer_result => {

				if(_.has(customer_result, 'email') && (customer == customer_result.email)){ return session; }

				return null;

			});

		});

	}

	getSessionByCustomerAndAlias({customer, alias}){

		du.debug('Get Session By Customer and Alias');

		if(!_.has(this, 'customerController')){
			const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
			this.customerController = new CustomerController();
		}

		return this.customerController.getCustomerByEmail(customer).then(customer_result => {

			if(_.isNull(customer_result)){ return null; }

			customer = customer_result;

			return this.customerController.getCustomerSessions(customer)
				.then(sessions => {

					if(!arrayutilities.nonEmpty(sessions)){ return null; }

					let matching_session = arrayutilities.find(sessions, session => {
						return session.alias == alias;
					});

					if(_.isObject(matching_session)){
						return matching_session;
					}

					return null;

				});

		});

	}
	/*
	async getPendingRebills(session){

		du.debug('Get Pending Rebills');

		const search = {

		}
		let rebills = await this.rebillController.getPendingRebills();

	}
	*/

}
