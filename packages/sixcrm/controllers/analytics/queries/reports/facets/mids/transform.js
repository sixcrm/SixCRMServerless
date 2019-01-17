const _ = require('lodash');
const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

module.exports = async (results) => {
	const ids = results.map(r => r.mid);

	const controller = new MerchantProviderController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'mid',
			values: []
		};

	}

	const mids = _.sortBy(response, 'name') || [];

	return {
		facet: 'mid',
		values: mids.map(r => {
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
