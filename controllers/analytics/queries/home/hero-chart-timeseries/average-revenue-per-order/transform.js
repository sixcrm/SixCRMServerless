module.exports = (results) => {
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
