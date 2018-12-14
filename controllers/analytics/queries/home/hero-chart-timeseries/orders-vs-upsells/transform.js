module.exports = (results) => {
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
				key: 'upsells',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.upsells)
					};
				})
			}
			]
		]
	});

}
