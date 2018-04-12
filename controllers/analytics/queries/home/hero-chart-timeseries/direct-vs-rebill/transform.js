const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

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
