const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = async (results) => {

	du.debug('Affiliate traffic report');

	return {

		records: results.map(r => {

			return Object.keys(r).map(k => {

				return {
					key: k,
					value: r[k]
				}

			})

		})

	};

}
