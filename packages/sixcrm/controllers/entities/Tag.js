const _ = require('lodash');
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class TagController extends entityController {

	constructor() {
		super('tag');
	}

	listByKey({key, pagination, search, reverse_order, fatal}) {
		const query_parameters = {
			key_condition_expression: '#key = :keyv',
			expression_attribute_names: {
				'#key': 'key'
			},
			expression_attribute_values: {
				':keyv': key
			}
		};

		return this.listByAccount({query_parameters, pagination, search, reverse_order, fatal});
	}

	listByKeyFuzzy({key, pagination, search, reverse_order, fatal}) {
		let query_parameters = {
			key_condition_expression: 'begins_with(#key, :keyv)',
			expression_attribute_names: {
				'#key': 'key'
			},
			expression_attribute_values: {
				':keyv': key
			}
		};

		return this.listByAccount({query_parameters, pagination, search, reverse_order, fatal});
	}

	listByEntity({id, pagination, fatal}) {
		return this.queryBySecondaryIndex({field: 'entity', index_value: id, index_name: 'entity-index', pagination: pagination, fatal: fatal});
	}

	listByEntityAndKey({id, key, pagination, fatal}) {
		//Technical Debt:  Convert this into a query
		return this.queryBySecondaryIndex({field: 'entity', index_value: this.getID(id), index_name: 'entity-index', pagination: pagination, fatal: fatal}).then(results => {
			if(_.has(results, 'tags') && arrayutilities.nonEmpty(results.tags)){
				let found = arrayutilities.find(results.tags, tag => {
					return tag.key == key;
				});
				if(!_.isUndefined(found) && !_.isNull(found)){
					return found;
				}
			}
			return null;
		});

	}

}
