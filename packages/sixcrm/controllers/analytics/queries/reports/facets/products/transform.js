const _ = require('lodash');
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

module.exports = async (results) => {
	const ids = results.map(r => r.product);

	const controller = new ProductController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'product',
			values: []
		};

	}

	const products = _.sortBy(response, 'name') || [];

	return {
		facet: 'product',
		values: products.map(r => {
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
