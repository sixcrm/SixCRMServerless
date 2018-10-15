module.exports = class QueryParser {

	static resolveFilterQuery(parameters, options = {}) {

		let filter = '';

		if (options.range) {

			filter = ' %s.datetime BETWEEN %L AND %L ';

		}

		if (options.account) {

			filter = this.resolveFilterQueryValue(filter, 'account', 'account', parameters);

		}

		if (options.campaign) {

			filter = this.resolveFilterQueryValue(filter, 'campaign', 'campaign', parameters);

		}

		if (options.product) {

			filter = this.resolveFilterQueryValue(filter, 'product', 'product_id', parameters);

		}

		if (options.productSchedule) {

			filter = this.resolveFilterQueryValue(filter, 'productSchedule', 'product_schedule_id', parameters);

		}

		if (options.productScheduleName) {

			filter = this.resolveFilterQueryValue(filter, 'productScheduleName', 'product_schedule_name', parameters);

		}

		if (options.affiliate) {

			filter = this.resolveFilterQueryValue(filter, 'affiliate', 'affiliate', parameters);

		}

		if (options.subId) {

			filter = this.resolveFilterQueryValueSubId(filter, parameters);

		}

		if (options.mid) {

			filter = this.resolveFilterQueryValue(filter, 'mid', 'merchant_provider', parameters);

		}

		if (options.chargeback) {

			filter = this.resolveFilterQueryValueChargeback(filter, 'chargeback', 'transaction_id', parameters);

		}

		if (options.response) {

			filter = this.resolveFilterQueryValue(filter, 'response', 'processor_result', parameters);

		}

		if (options.merchantCode) {

			filter = this.resolveFilterQueryValue(filter, 'merchantCode', 'merchant_code', parameters);

		}

		if (options.merchantMessage) {

			filter = this.resolveFilterQueryValue(filter, 'merchantMessage', 'merchant_message', parameters);

		}

		if (options.alias) {

			filter = this.resolveFilterQueryValue(filter, 'alias', 'alias', parameters);

		}

		if (options.rebillAlias) {

			filter = this.resolveFilterQueryValue(filter, 'rebillAlias', 'rebill_alias', parameters);

		}

		if (options.sessionAlias) {

			filter = this.resolveFilterQueryValue(filter, 'sessionAlias', 'session_alias', parameters);

		}

		if (options.session) {

			filter = this.resolveFilterQueryValue(filter, 'session', 'session', parameters);

		}

		if (options.campaignName) {

			filter = this.resolveFilterQueryValue(filter, 'campaignName', 'campaign_name', parameters);

		}

		if (options.customerName) {

			filter = this.resolveFilterQueryValue(filter, 'customerName', 'customer_name', parameters);

		}

		if (options.transactionType) {

			filter = this.resolveFilterQueryValue(filter, 'transactionType', 'transaction_type', parameters);

		}

		if (options.merchantProviderName) {

			filter = this.resolveFilterQueryValue(filter, 'merchantProviderName', 'merchant_provider_name', parameters);

		}

		if (options.merchantProvider) {

			filter = this.resolveFilterQueryValue(filter, 'merchantProvider', 'merchant_provider', parameters);

		}

		if (options.amount) {

			filter = this.resolveFilterQueryValue(filter, 'amount', 'amount', parameters);

		}

		if (options.type) {

			filter = this.resolveFilterQueryValue(filter, 'type', 'type', parameters);

		}

		if (options.status) {

			filter = this.resolveFilterQueryValue(filter, 'status', 'status', parameters);

		}

		if (options.cycle) {

			filter = this.resolveFilterQueryValue(filter, 'cycle', 'cycle', parameters);

		}

		if (options.interval) {

			filter = this.resolveFilterQueryValue(filter, 'interval', 'interval', parameters);

		}

		if (options.customerStatus) {

			filter = this.resolveFilterQueryValueCustomerStatus(filter, 'customerStatus', 'orders', parameters);

		}

		if (options.firstname) {

			filter = this.resolveFilterQueryValue(filter, 'firstname', 'firstname', parameters);

		}

		if (options.lastname) {

			filter = this.resolveFilterQueryValue(filter, 'lastname', 'lastname', parameters);

		}

		if (options.email) {

			filter = this.resolveFilterQueryValue(filter, 'email', 'email', parameters);

		}

		if (options.phone) {

			filter = this.resolveFilterQueryValue(filter, 'phone', 'phone', parameters);

		}

		if (options.city) {

			filter = this.resolveFilterQueryValue(filter, 'city', 'city', parameters);

		}

		if (options.state) {

			filter = this.resolveFilterQueryValue(filter, 'state', 'state', parameters);

		}

		if (options.zip) {

			filter = this.resolveFilterQueryValue(filter, 'zip', 'zip', parameters);

		}

		return filter;
	}

	static resolveFilterQueryValue(filter, identifier, map, parameters) {

		const inClause = ` AND %s.${map} IN (%L) `;
		const equalsClause = ` AND %s.${map} = %L `;

		if (parameters[identifier]) {

			if (parameters[identifier].length > 1) {

				return filter += inClause;

			} else {

				return filter += equalsClause;

			}

		} else {

			return filter;

		}

	}

	static resolveFilterQueryValueChargeback(filter, identifier, map, parameters) {

		const isClause = ` AND %s.${map} IS %s `;

		if (parameters[identifier]) {

			if (parameters[identifier][0] === 'yes') {

				parameters[identifier][0] = 'NOT NULL';

			}
			else {

				parameters[identifier][0] = 'NULL';

			}

			return filter += isClause;

		} else {

			return filter;

		}

	}

	static resolveFilterQueryValueCustomerStatus(filter, identifier, map, parameters) {

		const isClause = ` AND %s.${map} IS %s `;

		if (parameters[identifier]) {

			if (parameters[identifier][0] === 'active') {

				parameters[identifier][0] = 'NOT NULL';

			}
			else {

				parameters[identifier][0] = 'NULL';

			}

			return filter += isClause;

		} else {

			return filter;

		}

	}

	static resolveFilterQueryValueSubId(filter, parameters) {

		const inClause = ` AND (%s.subaffiliate_1 IN (%L) OR  %s.subaffiliate_2 IN (%L) OR %s.subaffiliate_3 IN (%L) OR %s.subaffiliate_4 IN (%L) OR %s.subaffiliate_5 IN (%L)) `;
		const equalsClause = ` AND (%s.subaffiliate_1 = %L OR  %s.subaffiliate_2 = %L OR %s.subaffiliate_3 = %L OR %s.subaffiliate_4 = %L OR %s.subaffiliate_5 = %L) `;

		if (parameters['subId']) {

			if (parameters['subId'].length > 1) {

				return filter += inClause;

			} else {

				return filter += equalsClause;

			}

		} else {

			return filter;

		}

	}

	static resolveFilterValue(local, prefix, identifier, parameters) {

		if (parameters[identifier]) {

			local.push(prefix);
			this.resolveValue(local, identifier, parameters);

		}

	}

	static resolveFilterValueSubId(local, prefix, parameters) {

		if (parameters['subId']) {

			local.push(prefix);
			this.resolveValue(local, 'subId', parameters)
			local.push(prefix);
			this.resolveValue(local, 'subId', parameters)
			local.push(prefix);
			this.resolveValue(local, 'subId', parameters)
			local.push(prefix);
			this.resolveValue(local, 'subId', parameters)
			local.push(prefix);
			this.resolveValue(local, 'subId', parameters)

		}

	}

	static resolveValue(local, identifier, parameters) {

		local.push(parameters[identifier]);

	}

}
