const _ = require('lodash');

const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const currencyutilities = require('@6crm/sixcrmcore/util/currency-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

module.exports = class RebillController extends entityController {

	constructor() {

		super('rebill');

		this.rebillHelperController = new RebillHelperController();

		this.search_fields = ['state'];

	}

	create({entity}){
		if(!_.has(entity, 'alias')){
			entity.alias = this.rebillHelperController.createAlias();
		}

		if(!_.has(entity, 'year_month')){
			entity.year_month = this.rebillHelperController.getYearMonth(entity.bill_at);
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){
		if(!_.has(entity, 'year_month')){
			entity.year_month = this.rebillHelperController.getYearMonth(entity.bill_at);
		}

		return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

	}

	//Technical Debt: finish!
	associatedEntitiesCheck() {
		return Promise.resolve([]);
	}

	getByAlias({alias}) {
		return this.getBySecondaryIndex({
			field: 'alias',
			index_value: alias,
			index_name: 'alias-index'
		});
	}

	listBySession({
		session,
		pagination
	}) {
		return this.queryBySecondaryIndex({
			field: 'parentsession',
			index_value: this.getID(session),
			index_name: 'parentsession-index',
			pagination
		});

	}

	getMerchantProvider(rebill) {
		if (_.has(rebill, 'merchant_provider')) {

			return this.executeAssociatedEntityFunction('MerchantProviderController', 'get', {
				id: rebill.merchant_provider
			});

		}

		return null;

	}

	listProductSchedules(rebill) {
		if (_.has(rebill, 'product_schedules') && arrayutilities.nonEmpty(rebill.product_schedules)) {

			let list_array = arrayutilities.filter(rebill.product_schedules, (list_item) => {
				return stringutilities.nonEmpty(list_item);
			});

			if (arrayutilities.nonEmpty(list_array)) {

				let query_parameters = this.createINQueryParameters({
					field: 'id',
					list_array: list_array
				});

				return this.executeAssociatedEntityFunction('ProductScheduleController', 'listByAccount', {
					query_parameters: query_parameters
				})
					.then((product_schedules) => this.getResult(product_schedules, 'productschedules'));

			}

		}

		return null;

	}

	listTransactions(rebill) {
		return this.executeAssociatedEntityFunction('transactionController', 'listTransactionsByRebillID', {
			id: this.getID(rebill)
		});

	}

	getParentSession(rebill) {

		if (!_.has(rebill, 'parentsession')) {
			return null;
		}

		return this.executeAssociatedEntityFunction('SessionController', 'get', {
			id: this.getID(rebill.parentsession)
		});

	}

	getParentSessionHydrated(rebill) {

		if (!_.has(rebill, 'parentsession')) {
			return null;
		}

		return this.executeAssociatedEntityFunction('SessionController', 'getSessionHydrated', {
			id: rebill.parentsession
		});

	}

	getRebillsAfterTimestamp(a_timestamp) {

		let timestamp_iso8601 = timestamp.castToISO8601(a_timestamp);

		let query_parameters = {
			filter_expression: '#bill_at < :timestamp_iso8601v AND #processing <> :processingv',
			expression_attribute_values: {
				':timestamp_iso8601v': timestamp_iso8601,
				':processingv': 'true'
			},
			expression_attribute_names: {
				'#bill_at': 'bill_at',
				'#processing': 'processing'
			}
		};

		return this.listByAccount({
			query_parameters: query_parameters
		}).then((data) => {

			return data.rebills || [];

		});

	}

	getPendingRebills({
		pagination,
		fatal,
		search
	}) {

		let query_parameters = {
			filter_expression: '#processing <> :processingv',
			expression_attribute_values: {
				':processingv': 'true'
			},
			expression_attribute_names: {
				'#processing': 'processing'
			}
		};

		return this.listByAccount({
			query_parameters: query_parameters,
			pagination: pagination,
			fatal: fatal,
			search: search
		});

	}

	getRebillsBilledAfter(after) {

		const query_parameters = {
			filter_expression: '#bill_at >= :after_iso8601v',
			expression_attribute_values: {
				':after_iso8601v': after
			},
			expression_attribute_names: {
				'#bill_at': 'bill_at'
			}
		};

		return this.listByAccount({
			query_parameters: query_parameters
		}).then((data) => {

			return data.rebills || [];

		});

	}

	listByState({
		state,
		state_changed_after,
		state_changed_before,
		pagination
	}) {
		let query_parameters = {};

		if (state) {
			query_parameters = this.appendFilterExpression(query_parameters, '#state = :statev');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#state', 'state');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statev', state);
		}

		if (state_changed_after) {
			query_parameters = this.appendFilterExpression(query_parameters, '#statechangedafter > :statechangedafterv');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#statechangedafter', 'state_changed_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statechangedafterv', state_changed_after);
		}

		if (state_changed_before) {
			query_parameters = this.appendFilterExpression(query_parameters, '#statechangedbefore <= :statechangedbeforev');
			query_parameters = this.appendExpressionAttributeNames(query_parameters, '#statechangedbefore', 'state_changed_at');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statechangedbeforev', state_changed_before);
		}

		return this.listByAccount({
			query_parameters: query_parameters,
			pagination: pagination
		});

	}

	async getResolvedAmount(rebill, transactions = null) {
		if (transactions === null) {
			transactions = (await this.listTransactions(rebill)).transactions;
			if (transactions === null) {
				return 0;
			}
		}


		const successful_transactions = arrayutilities.filter(transactions, transaction => transaction.result === 'success');
		const resolved_amount = arrayutilities.reduce(successful_transactions, (resolved_amount, transaction) => {
			const amount = parseFloat(transaction.amount);
			if (transaction.type === 'sale') {
				resolved_amount += amount;
			} else if (transaction.type === 'refund') {
				resolved_amount -= amount;
			} else if (transaction.type === 'reverse') {
				resolved_amount -= amount;
			}

			return resolved_amount;
		}, 0);

		return currencyutilities.toCurrency(resolved_amount);
	}

	async getPaidStatus(rebill, transactions = null) {
		if (transactions === null) {
			transactions = (await this.listTransactions(rebill)).transactions;
			if (transactions === null) {
				return 0;
			}
		}

		const amount = parseFloat(rebill.amount)
		const resolved_amount = parseFloat(await this.getResolvedAmount(rebill, transactions));

		if (resolved_amount >= amount) {
			return 'full';
		} else if (resolved_amount > 0) {
			return 'partial';
		} else {
			return 'none';
		}
	}

}
