
const _ = require('lodash');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class CustomerHelperController {

	constructor(){

		this.parameter_definition = {
			customerSessionBySecondaryIdentifier:{
				required: {
					customer: 'customer',
					secondaryidentifier: 'secondary_identifier'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'customer':global.SixCRM.routes.path('model', 'definitions/email.json'),
			'secondaryidentifier':global.SixCRM.routes.path('model', 'helpers/entities/customer/secondaryidentifier.json')
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	setGlobalCustomer(customer){

		du.debug('Set Global Customer');

		if(!_.has(this, 'customerController')){
			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			this.customerController = new CustomerController();
		}

		return this.customerController.setGlobalCustomer(customer);

	}

	async getCustomerJWT({customer = null, session = null}){

		du.debug('Get Customer JWT');

		if(_.isNull(customer)){

			if(_.isNull(session)){
				throw eu.getError('bad_request', 'The session or the customer must be defined in order to acquire a customer JWT.');
			}

			if(!_.has(this, 'sessionController')){
				const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
				this.sessionController = new SessionController();
			}

			session = await this.sessionController.get({id: session});

			if(_.isNull(session)){
				throw eu.getError('not_found', 'Session not found.');
			}

			customer = session.customer;

		}else{

			if(!_.has(this, 'customerController')){
				const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
				this.customerController = new CustomerController();
			}

			customer = await this.customerController.get({id: customer});

			if(_.isNull(customer)){
				throw eu.getError('not_found', 'Customer not found.');
			}

		}

		const TokenHelperController = global.SixCRM.routes.include('helpers', 'token/Token.js');
		let tokenHelperController = new TokenHelperController();

		let customer_jwt = tokenHelperController.getCustomerJWT(customer);

		return {token: customer_jwt};

	}

	customerSessionBySecondaryIdentifier({customer, secondary_identifier}){

		du.debug('Customer Session By Secondary Identifier');

		return Promise.resolve()
			.then(() =>  this.parameters.setParameters({argumentation: arguments[0], action:'customerSessionBySecondaryIdentifier'}))
			.then(() => {

				let secondary_identifier_functions = {
					'session.id':() => {
						const SessionHelperController = global.SixCRM.routes.include('helpers','entities/session/Session.js');
						let sessionHelperController = new SessionHelperController();

						return sessionHelperController.getSessionByCustomerAndID({customer: customer, id: secondary_identifier.value});
					},
					'session.alias':() => {
						const SessionHelperController = global.SixCRM.routes.include('helpers','entities/session/Session.js');
						let sessionHelperController = new SessionHelperController();

						return sessionHelperController.getSessionByCustomerAndAlias({customer: customer, alias: secondary_identifier.value});
					},
					// Technical Debt: Following two methods don't seem to exist.
					'transaction.alias':() => this.sessionController.getSessionByCustomentAndTransactionAlias({customer: customer, transaction_alias: secondary_identifier.value}),
					'creditcard.number':() => this.sessionController.getSessionByCustomerAndCreditCardNumber({customer: customer, lastfour: secondary_identifier.value})
				}

				return secondary_identifier_functions[secondary_identifier.type]().then(result => {
					return result;
				});

			});

	}

	getFullName(customer){

		du.debug('Get Full Name');

		let fullname = [];

		if(_.has(customer, 'firstname')){
			fullname.push(customer.firstname);
		}

		if(_.has(customer, 'lastname')){
			fullname.push(customer.lastname);
		}

		if(fullname.length > 0){
			return arrayutilities.compress(fullname, ' ', '');
		}

		return '';

	}

	getPublicFields(customer){

		du.debug('Get Public Fields');

		return objectutilities.transcribe(
			{
				"email":"email",
				"firstname":"firstname",
				"lastname":"lastname",
				"phone":"phone",
				"address":"address"
			},
			customer,
			{},
			false
		);

	}

	async getTag(entity, name){

		du.debug('Get Tag');

		const TagController = global.SixCRM.routes.include('entities', 'Tag.js');
		let tagController = new TagController();

		let tag = await tagController.listByEntityAndKey({id: entity, key: name});

		if(!_.isNull(tag)){
			return tag.value;
		}

		return null;

	}

}
