const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayUtilities = require('@6crm/sixcrmcore/util/array-utilities').default;
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

			const handlerMap = this._eventTypeHandlerMap[eventKey];

			if (!handlerMap) {

				du.warning('Analytics event type not mapped', message.event_type);

				return this._removeRecordFromSQS(r);

			}

			const messageHandlerPromises = handlerMap.handlers.map(async (h) => {

				const Transform = require(`./transforms/${handlerMap.transform}`);
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

		const inspections = promises.map((promise) => {

			return BBPromise.resolve(promise).reflect();

		});

		await BBPromise.each(inspections, i => i);

		inspections.forEach((i) => {

			if (i.value().isRejected()) {

				du.debug('Analytics event failed to write', i.value().reason());

			}

		});

		const ex = inspections.find(
			(i) => {

				return i.value().isRejected();

			});

		if (ex) {

			// throw the first exception once all promises have resolved
			throw ex.value().reason();

		}

	}


}
