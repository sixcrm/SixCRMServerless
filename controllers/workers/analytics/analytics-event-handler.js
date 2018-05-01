const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayUtilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const sqsprovider = new SQSProvider();
const BBPromise = require('bluebird');

module.exports = class AnalyticsEventHandler {

	constructor(auroraContext) {

		this._queueName = global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo';
		this._auroraContext = auroraContext;
		this._eventTypeHandlerMap = null;

	}

	execute() {

		du.debug('AnalyticsEventHandler.execute()');

		if (!this._eventTypeHandlerMap) {

			this._eventTypeHandlerMap = require('./analytics-event-router');

		}

		return this._getRecordsFromSQS();

	}

	_getRecordsFromSQS() {

		du.debug('AnalyticsEventHandler._getRecordsFromSQS()');

		return sqsprovider.receiveMessagesRecursive({
			queue: this._queueName
		}, {
			delegate: this._executeHandlers.bind(this)
		});

	}

	async _executeHandlers(records) {

		du.debug('AnalyticsEventHandler._executeHandlers()');

		if (!arrayUtilities.nonEmpty(records)) {

			return Promise.resolve(records);

		}

		const promises = records.map(async (r) => {

			const message = JSON.parse(r.Body);

			du.debug('Message recieved', message);

			if (!message.event_type) {

				du.warning('Analytics event missing type');

				return this._removeRecordFromSQS(r);

			}

			const eventKeys = Object.keys(this._eventTypeHandlerMap);
			const eventKey = eventKeys.find(ek => {

				const regex = new RegExp(`^${ek}`);
				return message.event_type.match(regex);

			});

			const handerMap = this._eventTypeHandlerMap[eventKey];

			if (!handerMap) {

				du.warning('Analytics event type not mapped', message.event_type);

				return this._removeRecordFromSQS(r);

			}

			const messageHandlerPromises = handerMap.handlers.map(async (h) => {

				const Transform = require(`./transforms/${handerMap.transform}`);
				const transformed = await new Transform().execute(message);
				const Handler = require(`./event-handlers/${h}`);
				const handler = new Handler(this._auroraContext);
				return handler.execute(transformed);

			});

			return Promise.all(messageHandlerPromises).then(() => this._removeRecordFromSQS(r));

		});

		return this._settle(promises).then(() => records);

	}

	_removeRecordFromSQS(record) {

		du.debug('AnalyticsEventHandler._removeRecordsFromSQS()');

		return sqsprovider.deleteMessage({
			queue: this._queueName,
			receipt_handle: record.ReceiptHandle
		});

	}

	async _settle(promises) {

		const inspections = await BBPromise.map(promises, (promise) => {

			return BBPromise.resolve(promise).reflect();

		});

		inspections.forEach((i) => {

			if (!i.isFulfilled()) {

				du.debug('Analytics event failed to write', i.reason());

			}

		});

		const ex = inspections.find(
			(r) => {

				return !r.isFulfilled();

			});

		if (ex) {

			// throw the first exception once all promises have resolved
			throw ex.reason();

		}

		return inspections.map((i) => i.value());

	}


}
