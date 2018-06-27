const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = (results) => {

	du.debug('Transformation Function');

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
