const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		timeseries: results.map((result) => {

			return {
				datetime: result.datetime,
				orders: Number(result.orders),
				revenue: Number(result.revenue)
			};

		})
	});

}