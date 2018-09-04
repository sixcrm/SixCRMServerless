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

Promise.all(_.map(['201804', '201805', '201806', '201807', '201808', '201809'], value => rebillController.queryBySecondaryIndex({
	field: 'year_month',
	index_value: value,
	index_name: 'year_month_bill_at-index'
}))).then(async result => {

	const rebills = _.flatten(_.map(result, value => value.rebills));
	_.remove(rebills, rebill =>
		!rebill ||
		rebill.parentsession === null ||
		rebill.parentsession === undefined ||
		moment(rebill.bill_at).isAfter(now));
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

		session.rebills = _.sortBy(session.rebills, rebill => moment(rebill.bill_at).valueOf());
		session.rebills[0].type = 'initial';
		for (let i = 1; i < session.rebills.length; i++) {

			session.rebills[i].type = 'recurring';

		}

	});

	const campaignIds = _.uniq(_.map(sessions, session => session.campaign));
	const campaigns = await campaignController.batchGet({ ids: campaignIds });
	const campaignNames = new Map(_.map(campaigns, campaign => [campaign.id, campaign.name]));
	du.info(campaigns.length.toString() + " campaigns");

	const customerIds = _.uniq(_.map(sessions, session => session.customer));
	const customers = await customerController.batchGet({ ids: customerIds });
	const customerNames = new Map(_.map(customers, customer => [customer.id, `${customer.firstname} ${customer.lastname}`]));
	du.info(customers.length.toString() + " customers");

	const rebillRows = _.map(rebills, rebill => {

		const session = sessionMap.get(rebill.parentsession);

		return [
			rebill.id,
			rebill.alias,
			rebill.bill_at,
			'processed',
			rebill.amount,
			(rebill.products && rebill.products.length) || 0,
			rebill.type,
			session.account,
			rebill.parentsession,
			session.alias,
			session.campaign,
			campaignNames.get(session.campaign),
			session.customer,
			customerNames.get(session.customer)
		];

	});

	process.env.aurora_host = await configurationAcquistion.getAuroraClusterEndpoint();
	await auroraContext.init();

	let query = `INSERT INTO analytics.f_rebill (id, alias, datetime, status, amount, item_count, type, account, session, session_alias, campaign, campaign_name, customer, customer_name) VALUES `;
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

	du.fatal("Error importing orders", err);

	return auroraContext.dispose();

});
