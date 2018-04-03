const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayUtilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const SQSProvider = global.SixCRM.routes.include('lib', 'providers/sqs-provider.js');
const sqsprovider = new SQSProvider();

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
			.then(records => this._executeHandlers(records));

	}

	_getRecordsFromSQS() {

		du.debug('AnalyticsEventHandler._getRecordsFromSQS()');

		return sqsprovider.receiveMessagesRecursive({
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

			du.debug('Message recieved', message);

			if (!message.type) {

				du.warning('Analytics event missing type');

				return this._removeRecordFromSQS(r);

			}

			const eventKeys = Object.keys(this._eventTypeHandlerMap);
			const eventKey = eventKeys.find(ek => {

				const regex = new RegExp(`^${ek}`);
				return message.type.match(regex);

			});

			const handerMap = this._eventTypeHandlerMap[eventKey];

			if (!handerMap) {

				du.warning('Analytics event type not mapped', message.type);

				return this._removeRecordFromSQS(r);

			}

			const messageHandlerPromises = handerMap.handlers.map(h => {

				const Handler = require(`./event-handlers/${h}`);
				const handler = new Handler(this._auroraContext);
				return handler.execute(message);

			});

			return Promise.all(messageHandlerPromises).then(() => this._removeRecordFromSQS(r));

		});

		return Promise.all(promises).then(() => records);

	}

	_removeRecordFromSQS(record) {

		du.debug('AnalyticsEventHandler._removeRecordsFromSQS()');

		return sqsprovider.deleteMessage({
			queue: this._queueName,
			receipt_handle: record.ReceiptHandle
		});

	}

}