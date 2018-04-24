const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		records: [
			[{
				key: 'averageRevenue',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.averagerevenue)
					};
				})
			}]
		]
	});

}