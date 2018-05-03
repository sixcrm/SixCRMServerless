const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ActivityStatement = require('../../../activity-statement');
const BBPromise = require('bluebird');

module.exports = async (results) => {

	du.debug('Activities report');

	const activityStatement = new ActivityStatement();

	await BBPromise.map(results, (async (r) => {

		r.activityStatement = await activityStatement.buildActivityEnglishObject(r);

	}));

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
