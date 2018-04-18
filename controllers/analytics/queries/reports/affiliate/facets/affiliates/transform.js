const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

module.exports = async (results) => {

	du.debug('Transformation Function');

	const ids = results.map(r => r.affiliate);

	const affiliates = await (new AffiliateController()).getByAffiliateIds(ids).affiliates || [];

	return Promise.resolve({
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
	});

}
