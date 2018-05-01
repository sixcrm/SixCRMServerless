const _ = require('lodash');
const moment = require('moment-timezone');
const uuid = require('uuid');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class AnalyticsEvent {

	static push(eventType, context) {

		du.debug('AnalyticsEvent.push()', eventType);

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
			queue: 'analytics.fifo'
		});

	}

}
