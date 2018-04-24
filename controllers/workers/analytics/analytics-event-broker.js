// const fs = require('fs');
// const uuid = require('uuid');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const BBPromise = require('bluebird');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class AnalyticsEventBroker {

	constructor() {

		this._eventTypeHandlerMap = null;
		this._sqsProvider = new SQSProvider();

	}

	execute(records) {

		du.debug('AnalyticsEventBroker.execute()');

		if (!this._eventTypeHandlerMap) {

			this._eventTypeHandlerMap = require('./analytics-event-router');

		}

		return BBPromise.map(records.Records, this._recordHandler.bind(this));

	}

	async _recordHandler(snsRecord) {

		try {

			const record = JSON.parse(snsRecord.Sns.Message);

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
			return result;

		} catch (ex) {

			du.error('AnalyticsEventBroker.recordHandler(): ERROR', ex);

		}

	}

	async _pushToQueue(record) {

		du.debug('AnalyticsEventBroker.pushToQueue()');

		// for testing: fs.writeFileSync(rdsObject.type + '-' + uuid.v4() + '.json', JSON.stringify(rdsObject), 'utf8');

		const sqsMessage = JSON.stringify(record);

		const queue = global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo';

		await this._sqsProvider.sendMessage({
			message_body: sqsMessage,
			queue,
			messageGroupId: 'analytics'
		});

	}

}
