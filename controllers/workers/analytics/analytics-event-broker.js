// const fs = require('fs');
// const uuid = require('uuid');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class AnalyticsEventBroker {

	constructor() {

		this._eventTypeHandlerMap = null;

	}

	execute(records) {

		du.debug('AnalyticsEventBroker.execute()');

		if (!this._eventTypeHandlerMap) {

			this._eventTypeHandlerMap = require('./analytics-event-router');

		}

		return Promise.all(records.Records.map(this._recordHandler.bind(this)));

	}

	_recordHandler(snsRecord) {

		try {

		const record = JSON.parse(snsRecord.Sns.Message);

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

		return Promise.resolve()
			.then(() => new Transform().execute(record))
			.then(this._pushToQueue.bind(this))
			.catch((ex) => {

				du.error('AnalyticsEventBroker.recordHandler()', ex);

			});

		} catch (ex) {

			du.error('AnalyticsEventBroker.recordHandler()', ex);

		}

	}

	_pushToQueue(record) {

		du.debug('AnalyticsEventBroker.pushToQueue()');

		// fs.writeFileSync(rdsObject.type + '-' + uuid.v4() + '.json', JSON.stringify(rdsObject), 'utf8');

		const sqsMessage = JSON.stringify(record);

		return global.SixCRM.routes.include('lib', 'sqs-utilities.js').sendMessage({
			message_body: sqsMessage,
			queue: 'rds_transaction_batch'
		}).then(() => {

			return record;

		});

	}

}