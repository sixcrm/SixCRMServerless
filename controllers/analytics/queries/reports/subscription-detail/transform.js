const moment = require('moment-timezone');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = async (results) => {

	du.debug('Subscription detail report');

	return {
		meta: {
			count: results.length
		},
		records: results.map(r => {

			const datetime = moment(r.datetime).utc();
			if (r.interval === 'monthly') {

				r.datetime = datetime.add(1, 'months').format();

			}
			else {

				const days = r.interval.substring(0, r.interval.indexOf(' '));
				r.datetime = datetime.add(days, 'days').format();

			}

			return Object.keys(r).map(k => {

				return {
					key: k,
					value: r[k]
				}

			})

		})

	};

}
