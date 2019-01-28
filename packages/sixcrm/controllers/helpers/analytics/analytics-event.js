//Technical Debt:  This needs to be a implementation of timestamp
const moment = require('moment-timezone');
const uuid = require('uuid');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class AnalyticsEvent {

	static push(eventType, context) {
		const message = {
			event_type: eventType,
			context: Object.assign({
				id: uuid.v4(),
				datetime: moment.tz('UTC').toISOString()
			}, context, {
				user: global.user
			})
		};

		if (!context.account) {
			du.warning('Context has no account', context, eventType);
		}

		return (new SQSProvider()).sendMessage({
			message_body: JSON.stringify(message),
			queue: global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo',
			messageGroupId: 'analytics'
		});

	}

}
