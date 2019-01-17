module.exports = (results) => {
	return Promise.resolve({
		records: [
			[{
				key: 'direct',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.direct)
					};
				})
			},
			{
				key: 'rebill',
				value: results.map(r => {
					return {
						datetime: r.datetime,
						value: Number(r.rebill)
					};
				})
			}
			]
		]
	});

}
