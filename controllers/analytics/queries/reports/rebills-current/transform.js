const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = async (results) => {

	du.debug('Rebills current report');

	return {
		meta: {
			count: results.length
		},
		records: results.map(r => {

			let avgTime = {
				days: 0,
				hours: 0,
				seconds: 0
			};

			if (!_.isEmpty(r.avg_time)) {

				avgTime = r.avg_time

			}

			if (_.isUndefined(avgTime.days)) {

				avgTime.days = 0

			}

			if (_.isUndefined(avgTime.hours)) {

				avgTime.hours = 0

			}

			if (_.isUndefined(avgTime.seconds)) {

				avgTime.seconds = 0

			}

			return [
				{
					key: 'queueName',
					value: r.queuename
				},
				{
					key: 'averageTime',
					value: avgTime.days * 86400 + avgTime.hours * 3600 + avgTime.seconds
				},
				{
					key: 'numberOfRebills',
					value: r.number_of_rebills
				},
				{
					key: 'failureRate',
					value: r.failure_rate
				}
			];

		})

	};

}
