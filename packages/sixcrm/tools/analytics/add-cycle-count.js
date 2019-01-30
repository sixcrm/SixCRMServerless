const _ = require('lodash');
const moment = require('moment');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const RebillController = require('../../controllers/entities/Rebill');
const SessionController = require('../../controllers/entities/Session');

const rebillController = new RebillController();
const sessionController = new SessionController();

rebillController.disableACLs();

// Process all existing rebills.
// If this needs to be run in the future, might need to add more values here beyond 2019-09.
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

	// Assign rebills to sessions so that we can determine the order in which they occurred.
	sessions.forEach(session => {

		session.rebills = [];

	});

	rebills.forEach(rebill => {

		let session = sessionMap.get(rebill.parentsession);
		session.rebills.push(rebill);

	});

	return Bluebird.each(sessions, async session => {

		session.rebills = _.sortBy(session.rebills, rebill => moment(rebill.bill_at).valueOf());
		for (let i = 0; i < session.rebills.length; i++) {

			const rebill = session.rebills[i];
			if (rebill.cycle === i) {
				continue;
			}
			else {
				du.warning(`Existing rebill ${rebill.id} with cycle ${rebill.cycle} should be ${i}`);

				if (process.env.DRY_RUN === 'false') {
					rebill.cycle = i;
					await rebillController.update({entity: rebill});
				}
			}

		}

	});

}).catch((err) => {

	du.fatal("Error adding cycle counts", err);

	return;

});
