const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = (results) => {

	du.debug('Transformation Function');

	return Promise.resolve({
		facet: 'affiliate',
		values: results.map(r => {
			return {
				key: r.affiliate,
				value: r.affiliate
			}
		})
	});

}
