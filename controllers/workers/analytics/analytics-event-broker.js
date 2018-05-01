// const fs = require('fs');
// const uuid = require('uuid');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const BBPromise = require('bluebird');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const sqsprovider = new SQSProvider();

module.exports = class AnalyticsEventBroker {

	constructor() {

		this._queueName = global.SixCRM.configuration.isLocal() ? 'analytics-transform' : 'analytics-transform.fifo';
		this._eventTypeHandlerMap = null;

	}

	get queueName() {

		return this._queueName;

	}

	async execute() {

		du.debug('AnalyticsEventBroker.execute()');

		if (!this._eventTypeHandlerMap) {

			this._eventTypeHandlerMap = require('./analytics-event-router');

		}

		const records = await this._getRecordsFromSQS();

		await this._execute(records);

	}

	_getRecordsFromSQS() {

		du.debug('AnalyticsEventBroker._getRecordsFromSQS()');

		return sqsprovider.receiveMessagesRecursive({
			queue: this._queueName
		}, {
			delegate: this._execute.bind(this)
		});

	}

	_removeRecordFromSQS(record) {

		du.debug('AnalyticsEventBroker._removeRecordsFromSQS()');

		return sqsprovider.deleteMessage({
			queue: this._queueName,
			receipt_handle: record.ReceiptHandle
		});

	}

	_execute(records) {

		return BBPromise.map(records, this._recordHandler.bind(this));

	}

	async _recordHandler(sqsRecord) {

		try {

			const record = JSON.parse(sqsRecord.Body);

			du.debug('AnalyticsEventBroker._recordHandler(): message recieved', record);

			const eventKeys = Object.keys(this._eventTypeHandlerMap);
			const eventKey = eventKeys.find(ek => {

				const regex = new RegExp(`^${ek}`);
				return record.event_type.match(regex);

			});

			const handerMap = this._eventTypeHandlerMap[eventKey];

			if (!handerMap) {

				return du.warning('AnalyticsEventBroker.execute(): event type not mapped', record.event_type);

			}

			const Transform = require(`./transforms/${handerMap.transform}`);
			const result = await new Transform().execute(record);
			await this._pushToQueue(result);
			await this._removeRecordFromSQS(sqsRecord);
			return result;

		} catch (ex) {

			du.error('AnalyticsEventBroker.recordHandler(): ERROR', ex);

		}

	}

	async _pushToQueue(record) {

		du.debug('AnalyticsEventBroker.pushToQueue()');

		// for testing: fs.writeFileSync(rdsObject.type + '-' + uuid.v4() + '.json', JSON.stringify(rdsObject), 'utf8');

		const sqsMessage = JSON.stringify(record);

		const queue = global.SixCRM.configuration.isLocal() ? 'analytics-write' : 'analytics-write.fifo';

		const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

		await new SQSProvider().sendMessage({
			message_body: sqsMessage,
			queue,
			messageGroupId: 'analytics'
		});

	}

}
