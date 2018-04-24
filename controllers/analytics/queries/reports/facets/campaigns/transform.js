const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

module.exports = async (results) => {

	du.debug('Campaign facet transformation function');

	const ids = results.map(r => r.campaign);

	const controller = new CampaignController();
	const response = await controller.getByIds(ids);

	if (!response) {

		return {
			facet: 'campaign',
			values: []
		};

	}

	const campaigns = _.sortBy(response.campaigns, 'name') || [];

	return {
		facet: 'campaign',
		values: campaigns.map(r => {
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