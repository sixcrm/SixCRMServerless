const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

module.exports = async (results) => {

	du.debug('Sub id facet transformation function');

	const ids = results.map(r => r.subid);

	const controller = new AffiliateController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'subId',
			values: []
		};

	}

	const affiliates = _.sortBy(response.affiliates, 'name') || [];

	return {
		facet: 'subId',
		values: affiliates.map(r => {
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
