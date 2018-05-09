const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

module.exports = async (results) => {

	du.debug('Product schedule facet transformation function');

	const ids = results.map(r => r.product_schedule);

	const controller = new ProductScheduleController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'productSchedule',
			values: []
		};

	}

	const productSchedules = _.sortBy(response, 'name') || [];

	return {
		facet: 'productSchedule',
		values: productSchedules.map(r => {
			return [{
				key: 'id',
				value: r.id
			}, {
				key: 'name',
				value: r.name
			}]
		})
	};

}
