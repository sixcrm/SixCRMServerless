
const _ = require('lodash');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

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
