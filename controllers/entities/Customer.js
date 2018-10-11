const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js');

module.exports = class CustomerController extends entityController {

	constructor() {

		super('customer');

		this.search_fields = ['email'];

	}

	async create({entity}){

		du.debug('Customer.create()');

		if(!_.has(entity, 'default_creditcard')){
			if(_.has(entity, 'creditcards') && arrayutilities.nonEmpty(entity.creditcards)){
				entity.default_creditcard = entity.creditcards[0];
			}
		}

		await AnalyticsEvent.push('customer', entity);

		return super.create({entity: entity});

	}

	//Technical Debt:  If a default creditcard exists, you shouldn't be able to remove it, only update it
	async update({entity, ignore_updated_at}){

		du.debug('Customer.update()');

		if(!_.has(entity, 'default_creditcard')){
			if(_.has(entity, 'creditcards') && arrayutilities.nonEmpty(entity.creditcards)){
				entity.default_creditcard = entity.creditcards[0];
			}
		}

		await AnalyticsEvent.push('customer', entity);

		return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

	}

	associatedEntitiesCheck({
		id
	}) {

		du.debug('Associated Entities Check');

		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('CustomerNoteController', 'listByCustomer', {
				customer: id
			}).then(customernotes => this.getResult(customernotes, 'customernotes')),
			this.executeAssociatedEntityFunction('SessionController', 'listByCustomer', {
				customer: id
			}).then(sessions => this.getResult(sessions, 'sessions'))
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let customernotes = data_acquisition_promises[0];
			let sessions = data_acquisition_promises[1];

			if (arrayutilities.nonEmpty(customernotes)) {
				arrayutilities.map(customernotes, (customernote) => {
					return_array.push(this.createAssociatedEntitiesObject({
						name: 'Customer Note',
						object: customernote
					}));
				});
			}

			if (arrayutilities.nonEmpty(sessions)) {
				arrayutilities.map(sessions, (session) => {
					return_array.push(this.createAssociatedEntitiesObject({
						name: 'Session',
						object: session
					}));
				});
			}

			return return_array;

		});

	}

	// Deprecate: Recursive Scan Query
	listByCreditCard({
		creditcard,
		pagination
	}) {

		du.debug('List By Credit Card')

		return this.listByAssociations({
			id: this.getID(creditcard),
			field: 'creditcards',
			pagination: pagination
		});

	}

	getAddress(customer) {

		du.debug('Get Address');

		return Promise.resolve(customer.address);

	}

	//Technical Debt:  This is somewhat messy.  Maybe we need to add this to a helper
	addCreditCard(customer, creditcard) {

		du.debug('Add Credit Card');

		const customerPromise = Promise.resolve().then(() => {
			if (!_.has(customer, this.primary_key)) {
				return this.get({
					id: customer
				});
			}
			return customer;
		})
			.then(_customer => {
				if (_.isNull(_customer)) {
					throw eu.getError('server', `Customer does not exist: ${customer}`);
				}
				return _customer;
			});

		const creditcardPromise = Promise.resolve().then(() => {
			if (!_.has(creditcard, 'id')) {
				return this.executeAssociatedEntityFunction('CreditCardController', 'get', {
					id: creditcard
				});
			}
			return creditcard;
		})
			.then(_creditcard => {
				if (_.isNull(_creditcard)) {
					throw eu.getError('server', `Creditcard does not exist: ${creditcard}`);
				}
				return _creditcard;
			});

		return Promise.all([customerPromise, creditcardPromise])
			.then(([customer, creditcard]) => {
				const customerUpdatePromise = Promise.resolve().then(() => {
					if (_.has(customer, 'creditcards')) {
						arrayutilities.isArray(customer.creditcards, true);
						if (_.includes(customer.creditcards, creditcard.id)) {
							return customer;
						}
						customer.creditcards.push(creditcard.id);
					} else {
						customer.creditcards = [creditcard.id];
					}

					return this.update({
						entity: customer
					});
				});

				const creditcardUpdatePromise = Promise.resolve().then(() => {
					if (_.has(creditcard, 'customers')) {
						arrayutilities.isArray(creditcard.customers, true);
						if (_.includes(creditcard.customers, customer.id)) {
							return creditcard;
						}
						creditcard.customers.push(customer.id);
					} else {
						creditcard.customers = [customer.id];
					}

					return this.executeAssociatedEntityFunction('CreditCardController', 'update', {
						entity: creditcard
					});
				});

				return Promise.all([customerUpdatePromise, creditcardUpdatePromise]);
			});

	}

	getCreditCards(customer) {

		du.debug('Get Credit Cards');

		if (_.has(customer, "creditcards") && arrayutilities.nonEmpty(customer.creditcards)) {

			let creditcard_ids = arrayutilities.map(customer.creditcards, creditcard => {
				return this.getID(creditcard);
			});

			return this.executeAssociatedEntityFunction('CreditCardController', 'batchGet', {
				ids: creditcard_ids
			});

		}

		return Promise.resolve(null);

	}


	getMostRecentCreditCard(customer) {

		du.debug('Get Most Recent Credit Card');

		return this.get({
			id: this.getID(customer)
		}).then((customer) => {

			if (_.isNull(customer)) {
				return null;
			}

			return this.getCreditCards(customer).then((credit_cards) => {

				if (arrayutilities.nonEmpty(credit_cards)) {

					let sorted_credit_cards = arrayutilities.sort(credit_cards, (a, b) => {

						if (a.updated_at > b.updated_at) {
							return 1;
						}

						if (a.updated_at < b.updated_at) {
							return -1;
						}

						return 0;

					});

					return sorted_credit_cards[0];

				}

				return null;

			});

		});

	}

	getCustomerByEmail(email) {

		du.debug('Get Customer By Email');

		return this.getBySecondaryIndex({
			field: 'email',
			index_value: email,
			index_name: 'email-index'
		});

	}

	getCustomerSessions(customer) {

		du.debug('Get Customer Sessions');

		return this.executeAssociatedEntityFunction('SessionController', 'getSessionByCustomer', this.getID(customer));

	}

	getCustomerRebills(customer) {

		du.debug('Get Customer Rebills');

		return this.getCustomerSessions(customer).then((sessions) => {

			if (arrayutilities.nonEmpty(sessions)) {

				let session_ids = []

				arrayutilities.map(sessions, (session) => {
					if (_.has(session, 'id')) {
						session_ids.push(session.id);
					}
				});

				session_ids = arrayutilities.unique(session_ids);

				return this.executeAssociatedEntityFunction('rebillController', 'listBy', {
					list_array: session_ids,
					field: 'parentsession'
				})
					.then(rebills => this.getResult(rebills, 'rebills'));

			}

			return null;

		});

	}

	listCustomerSessions({
		customer,
		pagination
	}) {

		du.debug('List Customer Sessions');

		return this.executeAssociatedEntityFunction('SessionController', 'listByCustomer', {
			customer: customer,
			pagination: pagination
		});

	}

	// Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
	// we retrieve data in 2 steps (sessions first, then rebills for each session and combine the results).
	listCustomerRebills({
		customer
	}) {

		du.debug('List Customer Rebills');

		return this.getCustomerSessions(customer).then((sessions) => {

			if (!sessions) {
				return this.createEndOfPaginationResponse('rebills', []);
			}

			let rebill_promises = arrayutilities.map(sessions, (session) => {
				return this.executeAssociatedEntityFunction('rebillController', 'listBySession', {
					session: session
				});
			});

			return Promise.all(rebill_promises).then((rebill_lists) => {

				let rebills = [];

				rebill_lists = rebill_lists || [];

				rebill_lists.forEach((rebill_list) => {

					let rebills_from_list = rebill_list.rebills || [];

					rebills_from_list.forEach((rebill) => {
						rebills.push(rebill);
					});
				});

				return this.createEndOfPaginationResponse('rebills', rebills);

			});

		});
	}

}
