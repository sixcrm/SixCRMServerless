const _ = require('lodash');
const BBPromise = require('bluebird');
const moment = require('moment-timezone');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const DynamoClient = require('./dynamo');
const dynamoClient = new DynamoClient();

const AnalyticsEvent = require('../../controllers/helpers/analytics/analytics-event');

Promise.resolve().then(async () => {

	let sessions = await dynamoClient.scan('sessions');
	du.info(`${sessions.length} sessions`);
	const sessionMap = new Map(sessions.map(session => [session.id, session]));

	const rebills = await dynamoClient.scan('rebills');
	du.info(`${rebills.length} rebills`);

	rebills.map(rebill => {

		if (rebill.parentsession && sessionMap.has(rebill.parentsession)) {

			const session = sessionMap.get(rebill.parentsession);
			if (!session.rebills) {

				session.rebills = [];

			}

			session.rebills.push(rebill);

		}

	});

	sessions = _.filter(sessions, session => session.rebills);
	du.info(`${sessions.length} sessions will rebills`);

	await BBPromise.each(sessions, async session => {

		session.rebills = _.sortBy(session.rebills, rebill => moment(rebill.bill_at).valueOf());
		const rebill = session.rebills[session.rebills.length - 1];

		const product_schedules = session && session.watermark && session.watermark.product_schedules;
		if (!product_schedules || !product_schedules.length) {

			return;

		}

		for (let i = 0; i < product_schedules.length; i++) {

			const product_schedule_item = product_schedules[i];
			const product_schedule = product_schedule_item.product_schedule;
			if (!product_schedule.id) {

				return;

			}

			for (let j = 0; j < product_schedule.schedule.length; j++) {

				const scheduleItem = product_schedule.schedule[j];

				const cycle = computeCycle(session.created_at, rebill.bill_at, scheduleItem);

				du.info(`${session.id} ${product_schedule.id} ${scheduleItem.product.id} ${cycle} ${rebill.bill_at}`);

				if (process.env.DRY_RUN === 'false') {

					await AnalyticsEvent.push('subscription', {
						session_id: session.id,
						product_schedule_id: product_schedule.id,
						product_id: scheduleItem.product.id,
						session_alias: session.alias,
						product_schedule_name: product_schedule.name,
						product_name: scheduleItem.product.name,
						datetime: rebill.bill_at,
						status: session.cancelled ? 'canceled' : 'active',
						amount: scheduleItem.price * product_schedule_item.quantity,
						item_count: product_schedule_item.quantity,
						cycle,
						interval: scheduleItem.samedayofmonth ? 'monthly' : `${scheduleItem.period} days`,
						account: session.account,
						campaign: session.campaign,
						merchant_provider: rebill.merchant_provider,
						customer: session.customer
					});

				}

			}

		}

		return;

	});

	return;

}).catch((err) => {

	du.fatal("Error importing subscriptions", err);

});

function computeCycle(session_start, bill_at, schedule) {

	let cycle = 0;
	let current = moment(session_start).startOf('day').add(schedule.start, 'days');
	const bill_day = moment(bill_at).startOf('day');
	while (current.isBefore(bill_day)) {

		if (schedule.samedayofmonth) {
			current.add(1, 'months');
		}
		else {
			current.add(schedule.period, 'days')
		}

		cycle++;

	}

	return cycle;

}
