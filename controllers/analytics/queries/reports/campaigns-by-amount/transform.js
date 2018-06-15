const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = async (results) => {

	du.debug('Campaigns by amount report');

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
