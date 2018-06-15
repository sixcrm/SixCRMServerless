const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = async (results) => {

	du.debug('Event funnel timeseries report');

	return {
		meta: {
			count: results.length
		},
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
