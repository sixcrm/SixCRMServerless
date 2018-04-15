const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		facet: 'campaign',
		values: results.map(r => {
			return {
				key: r.campaign,
				value: r.campaign
			}
		})
	});

}
