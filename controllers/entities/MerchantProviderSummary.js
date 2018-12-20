const _ = require('lodash');
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class MerchantProviderSummaryController extends entityController {

	constructor() {
		super('merchantprovidersummary');
	}

	listByMerchantProviderAndDateRange({merchant_providers, start, end, type, pagination}){
		merchant_providers = arrayutilities.map(merchant_providers, merchant_provider => this.getID(merchant_provider));
		end = (_.isNull(end) || _.isUndefined(end))?timestamp.getISO8601():end;

		let query_parameters = this.createINQueryParameters({field: 'merchant_provider', list_array: merchant_providers});

		query_parameters.expression_attribute_values = objectutilities.merge(query_parameters.expression_attribute_values, {':date_startv':start,':date_endv':end});
		query_parameters.filter_expression = query_parameters.filter_expression +' AND #date BETWEEN :date_startv AND :date_endv',
		query_parameters.expression_attribute_names = {'#date':'day'};

		if(!_.isUndefined(type) && !_.isNull(type)){
			query_parameters.filter_expression += ' AND #type = :typev';
			query_parameters.expression_attribute_values[':typev'] = type;
			query_parameters.expression_attribute_names['#type'] = 'type';
		}

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	listByMerchantProviders({merchant_providers, type, pagination}){
		merchant_providers = arrayutilities.map(merchant_providers, merchant_provider => this.getID(merchant_provider));

		let query_parameters = this.createINQueryParameters({field: 'merchant_provider', list_array: merchant_providers});

		if(!_.isUndefined(type) && !_.isNull(type)){
			query_parameters.filter_expression += ' AND #type = :typev';
			query_parameters.expression_attribute_values[':typev'] = type;
			query_parameters.expression_attribute_names = {'#type': 'type'};
		}

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	listByDateRange({start, end, type, pagination}){
		let query_parameters = {
			expression_attribute_values: {':date_startv':start,':date_endv':end},
			filter_expression: '#date > :date_startv AND #date < :date_endv',
			expression_attribute_names: {'#date':'day'}
		}

		if(!_.isUndefined(type) && !_.isNull(type)){
			query_parameters.filter_expression += ' AND #type = :typev';
			query_parameters.expression_attribute_values[':typev'] = type;
			query_parameters.expression_attribute_names['#type'] = 'type';
		}

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

}

