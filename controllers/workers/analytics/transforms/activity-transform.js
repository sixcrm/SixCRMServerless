const AnalyticsTransfrom = require('../analytics-transform');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class ActivityTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('ActivityTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		return {
			id: record.context.id,
			datetime: record.context.datetime,
			eventType: record.event_type,
			user: record.context.user ? record.context.user.id: undefined,
			account: record.context.account,
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
