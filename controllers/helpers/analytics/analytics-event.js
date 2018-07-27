//Technical Debt:  This needs to be a implementation of timestamp
const moment = require('moment-timezone');
const uuid = require('uuid');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class AnalyticsEvent {

	static push(eventType, context) {

		if (eventType === 'transaction' || eventType === 'rebill') {
			du.warning('AnalyticsEvent.push()', eventType, require('util').inspect(context, {
				showHidden: false,
				depth: null
			}));
		}
		else {
			du.debug('AnalyticsEvent.push()', eventType, require('util').inspect(context, {
				showHidden: false,
				depth: null
			}));
		}

		const message = {
			event_type: eventType,
			context: Object.assign({
				id: uuid.v4(),
				datetime: moment.tz('UTC').toISOString()
			}, context, {
				user: global.user
			})
		};

		return (new SQSProvider()).sendMessage({
			message_body: JSON.stringify(message),
			queue: global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo',
			messageGroupId: 'analytics'
		});

	}

}
