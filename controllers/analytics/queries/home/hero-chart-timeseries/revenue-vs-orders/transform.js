const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		records: [
			[{
				key: 'orders',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.orders)
					};
				})
			},
			{
				key: 'revenue',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.revenue)
					};
				})
			}
			]
		]
	});

}
