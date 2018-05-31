const _ = require('lodash');
const checksum = require('checksum');
const creditCardType = require('credit-card-type');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class CreditCardController extends entityController {

	constructor() {

		super('creditcard');

		this.search_fields = ['name'];

	}

	associatedEntitiesCheck({
		id
	}) {

		du.debug('Associated Entities Check');

		let return_array = [];

		let data_acquisition_promises = [
			this.get({
				id
			}).then(creditcard => this.listCustomers(creditcard))
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let customers = data_acquisition_promises[0];

			if (arrayutilities.nonEmpty(customers)) {
				arrayutilities.map(customers, customer => {
					return_array.push(this.createAssociatedEntitiesObject({
						name: 'Customer',
						object: customer
					}));
				});
			}

			return return_array;

		});

	}

	listByAccount(){

		du.debug('CreditCard.listByAccount()');

		return super.listByAccount(arguments[0]).then(result => {

			if(_.has(result, 'creditcards') && arrayutilities.nonEmpty(result.creditcards)){

				result.creditcards = result.creditcards.map(creditcard => {
					this.setType(creditcard);
					return creditcard;
				});

			}

			return result;

		});

	}

	batchGet(){

		du.debug('CreditCard.batchGet()');

		return super.batchGet(arguments[0]).then(result => {

			if(_.has(result, 'creditcards') && arrayutilities.nonEmpty(result.creditcards)){

				result.creditcards = result.creditcards.map(creditcard => {
					this.setType(creditcard);
					return creditcard;
				});

			}

			return result;

		});

	}

	get({
		id,
		hydrate_token
	}) {

		du.debug('Get Detokenized');

		hydrate_token = (_.isUndefined(hydrate_token) || _.isNull(hydrate_token)) ? false : hydrate_token;

		return super.get({
			id: id
		})
			.then((result) => {

				this.setType(result);

				if (hydrate_token === true) {

					if (!_.has(result, 'token')) {
						throw eu.getError('server', 'Unable to detokenize: entity is missing the token field');
					}

					const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
					this.tokenController = new TokenController();

					return this.tokenController.getToken(result.token).then((detokenized_result) => {

						result.number = detokenized_result;
						return result;

					});

				}

				return result;

			});

	}

	create({
		entity
	}) {

		du.debug('CreditCard.create()');

		//Technical Debt:  Validate that this is a creditcard with a number and cvv etc...

		return Promise.resolve(entity)
			.then((entity) => {

				this.assignPrimaryKey(entity);
				this.setLastFour(entity);
				this.setFirstSix(entity);
				this.setChecksum(entity);
				this.setType(entity);

				return entity;

			}).then(entity => {

				if(!_.has(entity, 'token')){

					if (!_.has(this, 'tokenController')) {
						const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
						this.tokenController = new TokenController();
					}

					return Promise.all([entity, this.tokenController.setToken({
						entity: entity.number
					})]);

				}else{
					return [entity, entity.token];
				}


			}).then(([entity, token]) => {

				if(_.has(entity, 'number')){
					delete entity.number;
				}

				if(_.has(entity, 'cvv')){
					delete entity.cvv;
				}

				if(!_.has(entity, 'token')){
					entity.token = token;
				}

				return entity;

			}).then(entity => {

				return super.create({
					entity
				});

			});

	}

	update({
		entity
	}) {

		du.debug('CreditCard.update()');

		return Promise.resolve(entity)
			.then((entity) => {

				return this.exists({
					entity: entity,
					return_entity: true
				}).then((existing_creditcard) => {

					this.setType(existing_creditcard);

					return {
						existing_creditcard: existing_creditcard,
						entity: entity
					};

				});

			})
			.then(({
				existing_creditcard,
				entity
			}) => {

				if (!_.has(existing_creditcard, 'id')) {
					throw eu.getError('not_found', 'Credit Card not found.');
				}

				return {
					existing_creditcard: existing_creditcard,
					entity: entity
				};

			}).then(({
				existing_creditcard,
				entity
			}) => {

				//Note:  We may need to assure that existing properties are not modified.
				let update_entity = objectutilities.transcribe({
					address: 'address',
					customers: 'customers',
					name: 'name',
					expiration: 'expiration'
				},
				entity,
				existing_creditcard,
				false
				);

				if(_.has(update_entity, 'number')){
					delete update_entity.number;
				}

				if(_.has(update_entity, 'cvv')){
					delete update_entity.cvv;
				}

				return update_entity;

			}).then((update_entity) => {

				return super.update({
					entity: update_entity
				});

			});

	}

	delete({
		id
	}) {

		du.debug('CreditCard.delete()');
		return Promise.resolve(id)
			.then((id) => this.exists({
				entity: {
					id: id
				},
				return_entity: true
			}))
			.then((existing_entity) => {

				if (!_.has(existing_entity, 'id')) {
					throw eu.getError('not_found', 'Unable to identify creditcard for delete.');
				}

				if (!_.has(this, 'tokenController')) {
					const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
					this.tokenController = new TokenController();
				}

				return Promise.all([existing_entity, this.tokenController.deleteToken(existing_entity.token)]);

			}).then(([existing_entity]) => {

				return super.delete({
					id: existing_entity.id
				});

			});

	}

	updateProperties({
		id,
		properties
	}) {

		du.debug('Update Properties');

		return Promise.resolve(id)
			.then((id) => {

				return this.exists({
					entity: {
						id: id
					},
					return_entity: true
				}).then((existing_creditcard) => {

					return existing_creditcard;

				});

			})
			.then((existing_creditcard) => {

				if (!_.has(existing_creditcard, 'id')) {
					throw eu.getError('not_found', 'Credit Card not found.');
				}

				return existing_creditcard;

			}).then((existing_creditcard) => {

				//Note:  We may need to assure that existing properties are not modified.
				let update_entity = objectutilities.transcribe({
					address: 'address',
					customers: 'customers',
					name: 'name',
					expiration: 'expiration'
				},
				properties,
				existing_creditcard,
				false
				);

				if(_.has(update_entity, 'number')){
					delete update_entity.number;
				}

				if(_.has(update_entity, 'cvv')){
					delete update_entity.cvv;
				}

				return update_entity;

			}).then((update_entity) => {

				return super.update({
					entity: update_entity
				});

			});

	}

	listCustomers(creditcard) {

		du.debug('List Customers');

		if (_.has(creditcard, "customers") && arrayutilities.nonEmpty(creditcard.customers)) {

			return this.executeAssociatedEntityFunction('CustomerController', 'batchGet', {
				ids: creditcard.customers
			})
				.then(customers => arrayutilities.filter(customers, customer => !_.isNull(customer)));

		}

		return Promise.resolve(null);

	}

	assureCreditCard(creditcard) {

		du.debug('Assure Credit Card', creditcard);

		if (this.sanitization) {
			throw eu.getError('server', 'Cannot Assure Credit Card while sanitizing results');
		}

		this.setLastFour(creditcard);
		this.setFirstSix(creditcard);
		this.setChecksum(creditcard);
		this.setType(creditcard);

		return this.queryBySecondaryIndex({
			field: 'checksum',
			index_value: creditcard.checksum,
			index_name: 'checksum-index'
		})
			.then((result) => {

				if (_.has(result, 'creditcards') && _.isArray(result.creditcards) && arrayutilities.nonEmpty(result.creditcards)) {

					if (!_.has(this, 'creditCardHelperController')) {
						const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
						this.creditCardHelperController = new CreditCardHelperController();
					}

					let found_card = arrayutilities.find(result.creditcards, (existing_creditcard) => {
						return this.creditCardHelperController.sameCard(creditcard, existing_creditcard);
					});

					if (!_.isUndefined(found_card)) {
						return found_card;
					}

				}

				return this.create({
					entity: creditcard
				});
			});

	}

	setLastFour(attributes) {

		du.debug('Set Last Four');

		if(!_.has(attributes, 'last_four')){
			if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
				attributes.last_four = attributes.number.slice(-4);
			}
		}

	}

	setFirstSix(attributes) {

		du.debug('Set First Six');

		if(!_.has(attributes, 'first_six')){
			if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
				attributes.first_six = attributes.number.substring(0, 6);
			}
		}

	}

	setChecksum(attributes) {
		du.debug('Set Checksum');
		if (
			_.has(attributes, 'first_six') &&
			_.has(attributes, 'last_four') &&
			_.has(attributes, 'expiration')
		) {
			const {first_six, last_four, expiration} = attributes;

			const normalized_expiration = `${expiration.slice(0, 2)}/${expiration.slice(-2)}`;
			attributes.checksum = checksum(`${first_six}.${last_four}.${normalized_expiration}`);
		}
	}

	setType(attributes, fatal = false){

		du.debug('Set Type');

		if(!_.has(attributes, 'type')){

			let bin = null;

			if(_.has(attributes, 'first_six')){
				bin = attributes.first_six;
			}else if(_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
				bin = attributes.number.substring(0, 6);
			}

			if(!_.isNull(bin)){

				let creditcard_types = creditCardType(bin);

				if(creditcard_types.length > 0){

					if(creditcard_types.length > 1){
						du.warning('Non specific creditcard type: '+JSON.stringify(creditcard_types));
					}

					attributes.type = creditcard_types[0].niceType;

				}else{

					if(fatal == true){
						throw eu.getError('server', 'Could not determine credit card type.');
					}

					du.warning('Could not determine credit card type.');

				}

			}

		}

	}

}
