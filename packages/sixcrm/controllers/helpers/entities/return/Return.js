const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

module.exports = class ReturnHelper {

	constructor() {

	}

	mergeHistories(entity, stored_entity = null) {
		this.assureUniqueProductGroupAliases(entity);

		return Promise.resolve()
			.then(() => this.assureStoredEntity(entity, stored_entity))
			.then((stored_entity) => {

				this.assurePresenceOfStoredEntityRecords(entity, stored_entity);
				return {
					entity: entity,
					stored_entity: stored_entity
				};

			})
			.then(({
				entity,
				stored_entity
			}) => {

				let new_entity = this.assureHistory(entity, stored_entity);
				return {
					entity: new_entity,
					stored_entity: stored_entity
				};

			})
			.then(({
				entity,
				stored_entity
			}) => {

				if (_.has(entity, 'transactions') && _.isArray(entity.transactions) && arrayutilities.nonEmpty(entity.transactions)) {
					arrayutilities.map(entity.transactions, (transaction, t_index) => {
						if (_.has(transaction, 'products') && _.isArray(transaction.products) && arrayutilities.nonEmpty(transaction.products)) {
							arrayutilities.map(transaction.products, (product_group, pg_index) => {
								let stored_entity_product_group = this.getMatchingProductGroup(stored_entity, product_group);
								entity.transactions[t_index].products[pg_index] = this.assureHistory(product_group, stored_entity_product_group);
							});
						}
					});
				}

				return entity;

			});

	}

	assurePresenceOfStoredEntityRecords(entity, stored_entity) {
		if (_.has(stored_entity, 'transactions') && _.isArray(stored_entity.transactions) && arrayutilities.nonEmpty(stored_entity.transactions)) {
			arrayutilities.map(stored_entity.transactions, (transaction) => {
				if (_.has(transaction, 'products') && _.isArray(transaction.products) && arrayutilities.nonEmpty(transaction.products)) {
					arrayutilities.map(transaction.products, (product_group) => {
						let matching_product_group = this.getMatchingProductGroup(entity, product_group);
						if(_.isNull(matching_product_group) || _.isUndefined(matching_product_group)){
							throw eu.getError('server', 'Missing product group: ' + product_group.alias);
						}
					});
				}
			});
		}

		return true;

	}

	assureUniqueProductGroupAliases(entity) {
		let aliases = [];

		if (_.has(entity, 'transactions') && _.isArray(entity.transactions) && arrayutilities.nonEmpty(entity.transactions)) {
			arrayutilities.map(entity.transactions, (transaction) => {
				if (_.has(transaction, 'products') && _.isArray(transaction.products) && arrayutilities.nonEmpty(transaction.products)) {
					arrayutilities.map(transaction.products, (product_group) => {
						aliases.push(product_group.alias);
					});
				}
			});
		}

		let unique_aliases = _.uniq(aliases);
		if (unique_aliases.length !== aliases.length) {
			throw eu.getError('server', 'Product group aliases must be unique.');
		}

		return true;

	}

	getMatchingProductGroup(entity, product_group) {
		let stored_entity_product_group = null;

		if (_.has(entity, 'transactions') && _.isArray(entity.transactions) && arrayutilities.nonEmpty(entity.transactions)) {
			arrayutilities.find(entity.transactions, (transaction) => {
				if (_.has(transaction, 'products') && _.isArray(transaction.products) && arrayutilities.nonEmpty(transaction.products)) {

					stored_entity_product_group = arrayutilities.find(transaction.products, (entity_product_group) => {
						return (entity_product_group.alias == product_group.alias);
					});

					if (!_.isNull(stored_entity_product_group) && !_.isUndefined(stored_entity_product_group)) {
						return true;
					}

				}
				return false;
			});
		}

		return stored_entity_product_group;

	}

	assureStoredEntity(entity, stored_entity) {
		if (!_.isNull(stored_entity)) {
			return Promise.resolve(stored_entity);
		}

		if (!_.has(entity, 'id')) {
			return Promise.resolve(null);
		}

		if (!_.has(this, 'returnController')) {
			const ReturnController = global.SixCRM.routes.include('entities', 'Return.js');
			this.returnController = new ReturnController();
		}

		return this.returnController.get({
			id: entity.id
		});

	}

	assureHistory(entity, stored_entity = null) {
		let new_history = [];
		let last_observed_event = null;
		let new_event = null;

		if (_.has(stored_entity, 'history') && _.isArray(stored_entity.history)) {
			new_history = _.sortBy(stored_entity.history, ['created_at']);
		}

		if (arrayutilities.nonEmpty(new_history)) {
			last_observed_event = _.last(new_history);
		}

		if (_.has(entity, 'history')) {

			if (!_.isArray(entity.history)) {
				throw eu.getError('server', 'Entity history element must be an array.');
			}

			if (!arrayutilities.nonEmpty(entity.history)) {
				throw eu.getError('server', 'A entity history element must have atleast 1 item.');
			}

			if ((entity.history.length - new_history.length) > 1) {
				throw eu.getError('server', 'You may only provide one new history element per request.');
			}

			entity.history = _.sortBy(entity.history, ['created_at']);

			new_event = _.last(entity.history);

		}

		if (_.isNull(new_event) && new_history.length == 0) {

			new_event = {
				state: 'created',
				created_at: timestamp.getISO8601()
			};

		}

		if (!_.isNull(new_event)) {

			if(!_.isEqual(new_event, last_observed_event)){

				if (!_.isNull(last_observed_event) && (new_event.created_at <= last_observed_event.created_at)) {
					throw eu.getError('server', 'New event timestamp is less than last observed event.');
				}

				if (new_history.length == 0) {
					if (new_event.state != 'created') {
						throw eu.getError('server', 'The first event in a history must have stated "created", "' + new_event.state + '" given.');
					}

				}

				new_history.push(new_event);

			}

		}

		entity.history = new_history;

		return entity;

	}

	createAlias() {

		let alias = random.createRandomString(9);

		return 'R' + alias;

	}

}
