const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		facets: [{
				facet: 'orders',
				timeseries: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.orders)
					};
				})
			},
			{
				facet: 'upsells',
				timeseries: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.upsells)
					};
				})
			}
		]
	});

}