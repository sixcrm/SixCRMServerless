const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class StateController extends entityController {

	constructor(){

		super('state');

	}

	async listByEntityAndState({entity, state}){

		du.debug('List By Entity And State');

		let query_parameters = {
			filter_expression: '#namek = :namev',
			expression_attribute_values: {
				':namev':state
			},
			expression_attribute_names: {
				'#namek':'name'
			},
		};

		return this.queryBySecondaryIndex({
			query_parameters: query_parameters,
			field: 'entity',
			index_value: entity,
			index_name: 'entity-index'
		});

	}

}
