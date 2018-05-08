const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = async (results) => {

	du.debug('Event funnel timeseries report');

	const byDate = _.groupBy(results, 'datetime');

	return {
		meta: {
			count: byDate.length
		},
		records: Object.keys(byDate).map(k => {
			return [{
				key: 'datetime',
				value: k
			}, {
				key: 'processorResults',
				value: byDate[k].map(r => {
					return {
						key: r.processor_result,
						value: {
							count: r.transaction_count,
							total: r.transaction_total
						}
					}
				})
			}];

		})

	};

}