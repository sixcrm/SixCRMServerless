const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayUtilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const sqsUtilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

module.exports = class AnalyticsEventHandler {

	constructor(queueName, auroraContext) {

		this._queueName = queueName;
		this._auroraContext = auroraContext;
		this._eventTypeHandlerMap = null;

	}

	get queueName() {

		return this._queueName;

	}

	execute() {

		du.debug('AnalyticsEventHandler.execute()');

		if (!this._eventTypeHandlerMap) {

			this._eventTypeHandlerMap = require('./analytics-event-router');

		}

		return this._getRecordsFromSQS()
			.then(records => this._executeHandlers(records))
			.then(records => this._removeRecordsFromSQS(records));

	}

	_getRecordsFromSQS() {

		du.debug('AnalyticsEventHandler._getRecordsFromSQS()');

		return sqsUtilities.receiveMessagesRecursive({
			queue: this._queueName
		});

	}

	_executeHandlers(records) {

		du.debug('AnalyticsEventHandler._executeHandlers()');

		if (!arrayUtilities.nonEmpty(records)) {

			return Promise.resolve(records);

		}

		const promises = records.map((r) => {

			const message = JSON.parse(r.Body);
			const eventKeys = Object.keys(this._eventTypeHandlerMap);
			const eventKey = eventKeys.find(ek => {

				const regex = new RegExp(ek);
				return message.event_type.match(regex);

			});

			const handerMap = this._eventTypeHandlerMap[eventKey];

			if (!handerMap) {

				du.console.warn('Analytics event type not mapped', message.event_type);

				return Promise.resolve();

			}

			return handerMap.handlers.map(h => {

				const Handler = require(`./event-handlers/${h}`);
				const handler = new Handler(this._auroraContext);
				return handler.execute();

			});

		});

		return Promise.all(_.flatten(promises))
			.then(() => records);

	}

	_removeRecordsFromSQS(records) {

		du.debug('AnalyticsEventHandler._removeRecordsFromSQS()');

		if (arrayUtilities.nonEmpty(records)) {

			return sqsUtilities.deleteMessages({
				messages: records,
				queue: this._queueName
			});

		} else {

			return Promise.resolve();

		}

	}

}