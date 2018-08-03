const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = async (results) => {

	du.debug('Transaction detail report');

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
