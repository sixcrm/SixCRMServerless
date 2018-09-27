const _ = require('lodash');
const moment = require('moment');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const RebillController = require('../../controllers/entities/Rebill');
const SessionController = require('../../controllers/entities/Session');
const CustomerController = require('../../controllers/entities/Customer');
const CampaignController = require('../../controllers/entities/Campaign');

const rebillController = new RebillController();
const sessionController = new SessionController();
const customerController = new CustomerController();
const campaignController = new CampaignController();

rebillController.disableACLs();

const now = moment();

const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');

// This is largely a copy-paste of import-orders.js, because it needs to do a lot of the same work
// to fetch all existing rebills and related data, group them by session, and order them by cycle.
// The major difference is in determining active and canceled subscriptions.

// Like import-orders, we're going to process all existing rebills, but we also have to process future rebills.
// If this needs to be run in the future, might need to add more values here.
Promise.all(_.map(['201804', '201805', '201806', '201807', '201808', '201809', '201810', '201811', '201812'], value => rebillController.queryBySecondaryIndex({
	field: 'year_month',
	index_value: value,
	index_name: 'year_month_bill_at-index'
}))).then(async result => {

	const rebills = _.flatten(_.map(result, value => value.rebills));
	_.remove(rebills, rebill =>
		!rebill ||
		rebill.parentsession === null ||
		rebill.parentsession === undefined);
	du.info(rebills.length.toString() + " rebills");

	const sessionIds = _.uniq(_.map(rebills, rebill => rebill.parentsession));
	const sessions = await sessionController.batchGet({ ids: sessionIds });
	_.remove(sessions, session => !session);
	const sessionMap = new Map(_.map(sessions, session => [session.id, session]));
	du.info(sessions.length.toString() + " sessions");

	_.remove(rebills, rebill => !sessionMap.has(rebill.parentsession));
	du.info(rebills.length.toString() + " rebills with valid session");

	// Assign rebills to sessions so that we can determine which ones are initial and which are recurring.
	sessions.forEach(session => {

		session.rebills = [];

	});

	rebills.forEach(rebill => {

		let session = sessionMap.get(rebill.parentsession);
		session.rebills.push(rebill);

	});

	sessions.forEach(session => {

		session.rebills = _.sortBy(session.rebills, rebill => rebill.cycle);
		for (let i = 0; i < session.rebills.length; i++) {

			// Note: 'canceled' is the preferred spelling in American English, but the session entity in
			// dynamo already has 'cancelled'.
			if (_.has(session.cancelled)) {
				session.rebills[i].status = 'canceled';
			}
			else if (i === 0) {
				// This does not represent a subscription, it's the initial order.
				session.rebills[i].status = 'initial';
			}
			else if (i === session.rebills.length - 1) {
				// The most recent rebill is the active subscription.
				session.rebills[i].status = 'active';
			}
			else {
				// Previous rebills are marked inactive when the subscription renews.
				session.rebills[i].status = 'inactive';
			}

		}

	});

	// Now we just have to look up the campaigns and customers.
	const campaignIds = _.uniq(_.map(sessions, session => session.campaign));
	const campaigns = await campaignController.batchGet({ ids: campaignIds });
	const campaignNames = new Map(_.map(campaigns, campaign => [campaign.id, campaign.name]));
	du.info(campaigns.length.toString() + " campaigns");

	const customerIds = _.uniq(_.map(sessions, session => session.customer));
	const customers = await customerController.batchGet({ ids: customerIds });
	const customerNames = new Map(_.map(customers, customer => [customer.id, `${customer.firstname} ${customer.lastname}`]));
	du.info(customers.length.toString() + " customers");

	let rebillRows = [];
	sessions.forEach(session => {

		if (_.some(session.rebills, rebill => rebill.cycle === undefined)) {
			return;
		}

		if (!(
			session.watermark &&
			session.watermark.product_schedules &&
			session.watermark.product_schedules[0] &&
			session.watermark.product_schedules[0].product_schedule &&
			session.watermark.product_schedules[0].product_schedule.schedule &&
			session.watermark.product_schedules[0].product_schedule.schedule[0])) {

			return;
		}

		const schedule = session.watermark.product_schedules[0].product_schedule.schedule;
		const interval = schedule[0].samedayofmonth ? '1 month' : schedule[0].period + ' days';

		session.rebills.forEach(rebill => {

			if (rebill.cycle > 0) {

				du.info(`${session.id}\t${rebill.id}\t${rebill.bill_at}\t${rebill.cycle}\t${rebill.status}\t${interval}`);

				rebillRows.push([
					rebill.id,
					rebill.alias,
					rebill.bill_at,
					rebill.status,
					rebill.amount,
					(rebill.products && rebill.products.length) || 0,
					rebill.cycle,
					interval,
					session.account,
					rebill.parentsession,
					session.alias,
					session.campaign,
					campaignNames.get(session.campaign),
					session.customer,
					customerNames.get(session.customer)
				]);

			}

		});

	});

	process.env.aurora_host = await configurationAcquistion.getAuroraClusterEndpoint();
	await auroraContext.init();

	let query = `INSERT INTO analytics.f_subscription (id, alias, datetime, status, amount, item_count, cycle, interval, account, session, session_alias, campaign, campaign_name, customer, customer_name) VALUES `;
	const values = rebillRows.map((r, i) => {

		return (`(${Array.from(r, (val, index) => (i * r.length) + index + 1).map(n => `$${n}`).join(',')})`);

	});
	query += values.join(',');
	query += ' ON CONFLICT (id) DO NOTHING';

	if (process.env.DRY_RUN !== 'false') {

		return;

	}

	await auroraContext.withConnection(async db => {

		return db.queryWithArgs(query, _.flatten(rebillRows));

	});

	return auroraContext.dispose();

}).catch((err) => {

	du.fatal("Error importing subscriptions", err);

	return auroraContext.dispose();

});
