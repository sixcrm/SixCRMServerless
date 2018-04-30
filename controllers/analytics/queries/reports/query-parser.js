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

		if (options.affiliate) {

			filter = this.resolveFilterQueryValue(filter, 'affiliate', 'affiliate', parameters);

		}

		if (options.subId) {

			filter = this.resolveFilterQueryValueSubId(filter, parameters);

		}

		if (options.mid) {

			filter = this.resolveFilterQueryValue(filter, 'mid', 'merchant_provider', parameters);

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

		if (parameters[identifier].length > 1) {

			local.push(parameters[identifier]);

		} else {

			local.push(parameters[identifier][0]);

		}

	}

}
