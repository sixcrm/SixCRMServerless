const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

module.exports = async (results) => {

	du.debug('Affiliate facet transformation function');

	const ids = results.map(r => r.affiliate);

	const controller = new AffiliateController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'affiliate',
			values: []
		};

	}

	const affiliates = _.sortBy(response, 'name') || [];

	return {
		facet: 'affiliate',
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
