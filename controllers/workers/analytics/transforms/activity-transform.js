const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ActivityTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('ActivityTransform.transform()');

		return {
			id: record.context.id,
			datetime: record.datetime,
			type: record.event_type,
			user: record.user,
			account: record.account,
			actor: record.context.actor,
			actorType: record.context.actor_type,
			action: record.context.action,
			actedUpon: record.context.acted_upon,
			actedUponType: record.context.acted_upon_type,
			associatedWith: record.context.associated_with,
			associatedWithType: record.context.associated_with_type,
		};

	}

}
